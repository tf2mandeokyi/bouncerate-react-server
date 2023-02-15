import React, { useCallback, useEffect, useState } from 'react'
import { getBounceRate, setBounceRate } from '../../api/bouncerate';
import { ProductCategory, getCategoriesCount, getCategoriesPage } from '../../api/categories';
import { getSetTopBox, getSetTopBoxesCount, getSetTopBoxesPage, SetTopBox } from '../../api/settopboxes';
import { padDecimal } from '../../utils/math';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { resetCurrentId } from '../../redux/currentIdSlice';
import EntityTable, { EntityToJSXFunction } from '../../components/entity-table';
import EntityDescriptionTable from '../../components/entity-description';
import Title from '../../components/title';


const SetTopBoxInformation : React.FC = () => {

    const [ setTopBox, setSetTopBox ] = useState<SetTopBox>();
    const [ updateBool, setUpdateBool ] = useState<boolean>();

    // redux stuff
    const currentIdState = useAppSelector((state) => state.currentId);
    const dispatch = useAppDispatch();


    const onBounceRateEditButtonClick = useCallback(async (category: ProductCategory, update: () => void) => {
        if(!currentIdState.id) return;

        let newBounceRate = parseFloat(prompt('새로운 Bounce rate 값을 입력해주세요.') as string);
        if(isNaN(newBounceRate)) return;

        await setBounceRate({ setTopBoxId: currentIdState.id, categoryId: category.id }, newBounceRate);
        update();
        setUpdateBool(true);
    }, [ currentIdState ]);


    const entityToJSX : EntityToJSXFunction<ProductCategory> = useCallback(async (category, update) => {
        if(!currentIdState.id) return <></>;

        let bounceRate = await getBounceRate({ setTopBoxId: currentIdState.id, categoryId: category.id });

        return [
            <>{ category.name }</>, 
            <>{ bounceRate ? padDecimal(bounceRate, 2) : '-' } %</>, 
            <div 
                key={ category.id } 
                className='button gray'
                onClick={ () => onBounceRateEditButtonClick(category, update) }
            >
                수정
            </div>
        ]
    }, [ currentIdState, onBounceRateEditButtonClick ]);


    useEffect(() => {
        (async () => {
            if(currentIdState.id) setSetTopBox(await getSetTopBox(currentIdState.id));
        })();
        if(updateBool) {
            setUpdateBool(false);
        }
    }, [ currentIdState, updateBool ]);


    return (
        <div className='sub-page-content'>
            <div onClick={() => dispatch(resetCurrentId())} className='x-sign' />
            { setTopBox ? <>
                <EntityDescriptionTable>
                    <tr><td colSpan={ 2 }>셋톱박스 상세정보</td></tr>
                    <tr><td>셋톱박스 UUID</td><td>{ setTopBox.uuid }</td></tr>
                    <tr><td>셋톱박스 위치</td><td>{ setTopBox.location ?? '-' }</td></tr>
                </EntityDescriptionTable>
                <EntityTable<ProductCategory>
                    tableHeadColumn={ [ <>상품 그룹명</>, [ <>Bounce rate</>, 2 ] ] }
                    getEntityCount={ getCategoriesCount }
                    getEntitiesPage={ getCategoriesPage }
                    entityToJSX={ entityToJSX }
                    selectable={ false }
                />
            </> : <>
                Loading...
            </> }
        </div>
    )
}


const SetTopBoxList : React.FC = () => {

    // redux stuff
    const currentIdState = useAppSelector((state) => state.currentId);

    const entityToJSX : EntityToJSXFunction<SetTopBox> = useCallback(async (setTopBox) => {
        return [
            <>{ setTopBox.uuid }</>,
            <>{ setTopBox.location ?? '-' }</>
        ]
    }, []);

    return <>
        <div className='sub-page-content'>
            <Title>셋톱박스 목록</Title>
            <EntityTable<SetTopBox>
                tableHeadColumn={ [ <>셋톱박스 UUID</>, <>셋톱박스 위치</> ] }
                getEntityCount={ getSetTopBoxesCount }
                getEntitiesPage={ getSetTopBoxesPage }
                entityToJSX={ entityToJSX }
                selectable={ true }
            />
        </div>
        {typeof currentIdState.id !== 'undefined' ? <SetTopBoxInformation /> : <></>}
    </>
}

export default SetTopBoxList