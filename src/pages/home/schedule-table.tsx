import React, { useCallback, useEffect, useState } from 'react'
import { NumberRange } from '../../api';
import { getAllCategories, ProductCategory } from '../../api/categories';
import { calculateAlternativeStreams, calculateTimeSlotBounceRate, deleteStreamSchedule, getAllTimeSlotBounceRates, getTable, ScheduleTable, setStreamSchedule, TimeSlotBounceRate } from '../../api/scheduleTable';
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
    bounceRateRange: NumberRange;
}
const MainPageScheduleTable : React.FC<TableProps> = ({ bounceRateRange }) => {
    
    const [ update, setUpdate ] = useState<boolean>(true);
    const [ tableData, setTableData ] = useState<ScheduleTable>();
    const [ slotLoadingArray, setSlotLoadingArray ] = useState<LoadingData[]>();
    const [ categoryMap, setCategoryMap ] = useState<ProductCategoryMap>();
    const [ tableBounceRateData, setTableBounceRateData ] = useState<(TimeSlotBounceRate | null)[]>();


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

        setTableData(t => t ? {
            table: t.table.map((e, i) => {
                if(i !== timeSlotId) return e;
                let newStreamArray = [ ...e ];
                newStreamArray[streamNumber] = categoryId;
                return newStreamArray;
            })
        } : undefined);
        setTableBounceRateData(t => t?.map((e, i) => i === timeSlotId && e ? {
            onlyDefault: e.onlyDefault, withAlt: e.withAlt, needsUpdate: true
        } : e))
    }, [ tableData ]);


    const setSlotLoading = useCallback((timeSlotId: number, data: LoadingData) => {
        setSlotLoadingArray(sl => sl?.map((e, i) => i === timeSlotId ? data : e));
    }, []);


    const recalculateAlternativeStreams = useCallback(async (timeSlotId: number) => {
        setSlotLoading(timeSlotId, { altStream: true, bounceRate: true });

        let { altStreams, bounceRate } = await calculateAlternativeStreams(timeSlotId, bounceRateRange);
        setTableBounceRateData(t => t?.map((e, i) => i === timeSlotId ? bounceRate : e))
        setTableData(t => t ? {
            table: t.table.map((e, i) => i === timeSlotId ? [ e[0], ...altStreams ] : e)
        } : undefined);

        setSlotLoading(timeSlotId, { altStream: false, bounceRate: false });
    }, [ bounceRateRange, setSlotLoading ]);


    const recalculateTimeSlotBounceRate = useCallback(async (timeSlotId: number) => {
        setSlotLoading(timeSlotId, { altStream: false, bounceRate: true });

        let newBounceRate = await calculateTimeSlotBounceRate(timeSlotId, bounceRateRange);
        setTableBounceRateData(t => t?.map((e, i) => i === timeSlotId ? newBounceRate : e))

        setSlotLoading(timeSlotId, { altStream: false, bounceRate: false });
    }, [ bounceRateRange, setSlotLoading ]);


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
                initialId={ tableData?.table[i][0] ?? null }
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
                initialId={ tableData?.table[i][altNumber] ?? null }
                highlightDefault={ true }
            />;
            
            return (
                <td key={ `alt-${altNumber}-${e}` }>{ tdContent }</td>
            );
        })
    }, [ setStream, categoryMap, tableData, slotLoadingArray ]);


    const getBounceRateList = useCallback((type: 'onlyDefault' | 'withAlt') => {
        if(!tableBounceRateData || !slotLoadingArray) return <td colSpan={ 999 }>Loading...</td>;

        return timeSlotName.map((e, i) => {
            let timeSlotBounceRate = tableBounceRateData[i];
            
            let bounceRateString = timeSlotBounceRate ? padDecimal(timeSlotBounceRate[type], 2) : '-';

            let recalculateButton = type === 'withAlt' &&
                    (!timeSlotBounceRate || timeSlotBounceRate?.needsUpdate) ?
                    <div className='button gray' onClick={ () => recalculateTimeSlotBounceRate(i) }>
                        재계산
                    </div> : <></>
            
            let tdContent = slotLoadingArray[i].bounceRate ? <LoadingCircle /> : <>
                { bounceRateString } % <br/>
                { recalculateButton }
            </>;
            
            return (
                <td key={ `br-${type}-${e}` }>
                    { tdContent }
                </td>
            );
        })
    }, [ tableBounceRateData, recalculateTimeSlotBounceRate, slotLoadingArray ])


    // Data initialization
    useEffect(() => {
        if(update) {
            (async () => setTableData(await getTable()))();
            (async () => setTableBounceRateData(await getAllTimeSlotBounceRates()))();
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
                        { getBounceRateList('onlyDefault') }
                    </tr>
                    <tr><td>대체 1</td>{ getAltStreamList(1) }</tr>
                    <tr><td>대체 2</td>{ getAltStreamList(2) }</tr>
                    <tr><td>대체 3</td>{ getAltStreamList(3) }</tr>
                    <tr className='br-exp'>
                        <td>예상 Bounce rate</td>
                        { getBounceRateList('withAlt') }
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default MainPageScheduleTable