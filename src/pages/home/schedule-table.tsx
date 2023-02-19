import React, { useCallback, useEffect, useState } from 'react'
import { getAllCategories, ProductCategory } from '../../api/categories';
import { BounceRateTable, calculateAlternativeStreams, calculateTimeSlotBounceRate, deleteStreamSchedule, getBounceRateTable, getTable, ScheduleTable, setStreamSchedule } from '../../api/scheduleTable';
import LoadingCircle from '../../components/loading-circle';
import { setCategoryList } from '../../redux/categoryListSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { padDecimal } from '../../utils/math';

import './schedule-table.scss'


type ProductCategoryMap = { [ x: number ]: ProductCategory };

type DropDownProps = {
    callback?: (id: number | null) => void;
    initialId: number | null;
    highlightDefault?: boolean;
}
const ProductCategoryDropDown : React.FC<DropDownProps> = ({
    callback, initialId, highlightDefault
}) => {

    highlightDefault = highlightDefault ?? false;

    const [ options, setOptions ] = useState<JSX.Element[]>();
    const categoryListState = useAppSelector(state => state.categoryList);

    useEffect(() => {
        if(!categoryListState.list) return;
        let categoryList = [ { id: undefined, name: '-' }, ...categoryListState.list ]

        let optionList : JSX.Element[] = [];
        for(let category of categoryList) {
            let className = undefined;
            if(category.id === initialId && highlightDefault) {
                className = 'highlighted';
            }

            optionList.push(
                <option 
                    className={ className }
                    key={ category.id } 
                    value={ category.id ?? 'null' }
                >
                    { category.name }
                </option>
            )
        }
        setOptions(optionList);
    }, [ categoryListState, highlightDefault, initialId ])

    return (
        <select 
            className='dropdown' 
            onChange={ (e) => {
                let { value } = e.target;
                callback?.(value === 'null' ? null : parseInt(value))
            } }
            value={ initialId ?? 'null' }
        >
            { options }
        </select>
    )
}


const timeSlotName = [ '시간 1', '시간 2', '시간 3', '시간 4', '시간 5', '시간 6' ];

interface LoadingData {
    altStream: boolean;
    bounceRate: boolean;
}
interface TableProps {
    maxBounceRate: number;
}
const MainPageScheduleTable : React.FC<TableProps> = ({ maxBounceRate }) => {
    
    const [ update, setUpdate ] = useState<boolean>(true);
    const [ tableData, setTableData ] = useState<ScheduleTable>();
    const [ slotLoadingArray, setSlotLoadingArray ] = useState<LoadingData[]>();
    const [ categoryMap, setCategoryMap ] = useState<ProductCategoryMap>();
    const [ bounceRateTableData, setBounceRateTableData ] = useState<BounceRateTable>();


    // redux stuff
    const categoryListState = useAppSelector(state => state.categoryList);
    const dispatch = useAppDispatch();


    const updateCategoryMap = useCallback(async () => {
        if(categoryListState.list) return;
        let list = await getAllCategories();
        dispatch(setCategoryList(list));

        let map: ProductCategoryMap = {};
        for(let category of list) {
            map[category.id] = category;
        }
        setCategoryMap(map);
    }, [ categoryListState, dispatch ]);


    const setStream = useCallback((timeSlotId: number, streamNumber: number, categoryId: number | null) => {
        if(!tableData) return;
        
        if(categoryId !== null) setStreamSchedule(timeSlotId, streamNumber, categoryId);
        else deleteStreamSchedule(timeSlotId, 0);

        setTableData(t => {
            if(!t) return undefined;
            let newTable = { ...t };
            newTable[timeSlotId][streamNumber] = categoryId;
            return newTable;
        });
        setBounceRateTableData(t => {
            if(!t) return undefined;
            let newTable = { ...t };
            let nodeValue = newTable[timeSlotId][streamNumber];
            if(nodeValue) nodeValue.needsUpdate = true;
            return newTable;
        })
    }, [ tableData ]);


    const setSlotLoading = useCallback((timeSlotId: number, data: LoadingData) => {
        setSlotLoadingArray(sl => sl?.map((e, i) => i === timeSlotId ? data : e));
    }, []);


    const recalculateAlternativeStreams = useCallback(async (timeSlotId: number) => {
        setSlotLoading(timeSlotId, { altStream: true, bounceRate: true });

        let { altStreams, bounceRateArray } = await calculateAlternativeStreams(timeSlotId, maxBounceRate);

        setTableData(t => {
            if(!t) return undefined;
            let newTable = { ...t };
            newTable[timeSlotId] = [ t[timeSlotId][0], ...altStreams ];
            return newTable;
        });
        setBounceRateTableData(t => {
            if(!t) return undefined;
            let newTable = { ...t };
            newTable[timeSlotId] = bounceRateArray;
            return newTable;
        })

        setSlotLoading(timeSlotId, { altStream: false, bounceRate: false });
    }, [ maxBounceRate, setSlotLoading ]);


    const recalculateTimeSlotBounceRate = useCallback(async (timeSlotId: number) => {
        setSlotLoading(timeSlotId, { altStream: false, bounceRate: true });

        let newBounceRate = await calculateTimeSlotBounceRate(timeSlotId, maxBounceRate);

        setBounceRateTableData(t => {
            if(!t) return undefined;
            let newTable = { ...t };
            newTable[timeSlotId] = newBounceRate;
            return newTable;
        })

        setSlotLoading(timeSlotId, { altStream: false, bounceRate: false });
    }, [ maxBounceRate, setSlotLoading ]);


    const getTableHead = useCallback(() => {
        return timeSlotName.map((n, i) => (
            <td key={ n }>
                { n }<br></br>
                <div className='button gray' onClick={ () => recalculateAlternativeStreams(i) }>
                    편성
                </div>
            </td>
        ))
    }, [ recalculateAlternativeStreams ]);


    const getDefaultStreamList = useCallback(() => {
        if(!tableData || !categoryMap) return <td colSpan={ 999 }>Loading...</td>;

        return timeSlotName.map((e, i) => <td key={ `default-${e}` }>
            <ProductCategoryDropDown
                callback={ (id) => setStream(i, 0, id) }
                initialId={ tableData?.[i][0] ?? null }
            />
        </td>)
    }, [ categoryMap, setStream, tableData ]);


    const getAltStreamList = useCallback((altNumber: number) => {
        if(!tableData || !categoryMap || !slotLoadingArray) {
            return altNumber === 1 ? <td colSpan={ 999 }>Loading...</td> : <></>;
        }
        return timeSlotName.map((e, i) => {
            let tdContent = slotLoadingArray[i].altStream ? <LoadingCircle /> : <ProductCategoryDropDown
                callback={ (id) => setStream(i, altNumber, id) }
                initialId={ tableData[i][altNumber] ?? null }
                highlightDefault={ true }
            />;
            
            return (
                <td key={ `alt-${altNumber}-${e}` }>{ tdContent }</td>
            );
        })
    }, [ setStream, categoryMap, tableData, slotLoadingArray ]);


    const getBounceRateList = useCallback((streamNumber: number) => {
        if(!bounceRateTableData || !slotLoadingArray) return <td colSpan={ 999 }>Loading...</td>;

        return timeSlotName.map((e, i) => {
            let timeSlotBounceRate = bounceRateTableData[i][streamNumber];
            
            let bounceRateString = timeSlotBounceRate ? padDecimal(timeSlotBounceRate.bounceRate, 2) : '-';

            let recalculateButton = streamNumber === 3 &&
                    (!timeSlotBounceRate || timeSlotBounceRate?.needsUpdate) ?
                    <div className='button gray' onClick={ () => recalculateTimeSlotBounceRate(i) }>
                        재계산
                    </div> : <></>
            
            let tdContent = slotLoadingArray[i].bounceRate ? <LoadingCircle /> : <>
                { bounceRateString } % <br/>
                { recalculateButton }
            </>;
            
            return (
                <td key={ `br-${streamNumber}-${e}` }>
                    { tdContent }
                </td>
            );
        })
    }, [ bounceRateTableData, recalculateTimeSlotBounceRate, slotLoadingArray ])


    // Data initialization
    useEffect(() => {
        if(update) {
            (async () => setTableData(await getTable()))();
            (async () => setBounceRateTableData(await getBounceRateTable()))();
            (async () => updateCategoryMap())();
            setSlotLoadingArray(timeSlotName.map(() => ({ altStream: false, bounceRate: false })))
        }
        setUpdate(false);
    }, [ update, updateCategoryMap ]);


    return (
        <div className='schedule-table-wrapper'>
            <table>
                <thead><tr>
                    <td key='thead-empty'></td>
                    { getTableHead() }
                </tr></thead>
                <tbody>
                    <tr>
                        <td>기본</td>
                        { getDefaultStreamList() }
                    </tr>
                    <tr className='br-exp'>
                        <td>예상 Bounce rate</td>
                        { getBounceRateList(0) }
                    </tr>
                    <tr><td>대체 1</td>{ getAltStreamList(1) }</tr>
                    <tr className='br-exp'>
                        <td>예상 Bounce rate</td>
                        { getBounceRateList(1) }
                    </tr>
                    <tr><td>대체 2</td>{ getAltStreamList(2) }</tr>
                    <tr className='br-exp'>
                        <td>예상 Bounce rate</td>
                        { getBounceRateList(2) }
                    </tr>
                    <tr><td>대체 3</td>{ getAltStreamList(3) }</tr>
                    <tr className='br-exp'>
                        <td>예상 Bounce rate</td>
                        { getBounceRateList(3) }
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default MainPageScheduleTable