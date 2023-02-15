import React, { useCallback, useEffect, useState } from 'react'
import { getBounceRate, setBounceRate } from '../../api/bouncerate';
import { ProductCategory, getCategory, getCategoriesCount, getCategoriesPage } from '../../api/categories';
import { getSetTopBoxesCount, getSetTopBoxesPage, SetTopBox } from '../../api/settopboxes';
import { padDecimal } from '../../utils/math';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { resetCurrentId } from '../../redux/currentIdSlice';
import EntityTable, { EntityToJSXFunction } from '../../components/entity-table';
import EntityDescriptionTable from '../../components/entity-description';
import Title from '../../components/title';


const ProductCategoryInformation : React.FC = () => {

    const [ category, setCategory ] = useState<ProductCategory>();
    const [ updateBool, setUpdateBool ] = useState<boolean>();

    // redux stuff
    const currentIdState = useAppSelector((state) => state.currentId);
    const dispatch = useAppDispatch();


    const onBounceRateEditButtonClick = useCallback(async (setTopBox: SetTopBox, update: () => void) => {
        if(!currentIdState.id) return;

        let newBounceRate = parseFloat(prompt('새로운 Bounce rate 값을 입력해주세요.') as string);
        if(isNaN(newBounceRate)) return;

        await setBounceRate({ categoryId: currentIdState.id, setTopBoxId: setTopBox.id }, newBounceRate);
        update();
        setUpdateBool(true);
    }, [ currentIdState ]);


    const entityToJSX : EntityToJSXFunction<SetTopBox> = useCallback(async (setTopBox, update) => {
        if(!currentIdState.id) return <></>;

        let bounceRate = await getBounceRate({ categoryId: currentIdState.id, setTopBoxId: setTopBox.id });

        return [
            <>{ setTopBox.uuid }</>, 
            <>{ bounceRate ? padDecimal(bounceRate, 2) : '-' } %</>, 
            <div 
                key={ setTopBox.id } 
                className='button gray'
                onClick={ () => onBounceRateEditButtonClick(setTopBox, update) }
            >
                수정
            </div>
        ]
    }, [ currentIdState, onBounceRateEditButtonClick ]);


    useEffect(() => {
        (async () => {
            if(currentIdState.id) setCategory(await getCategory(currentIdState.id));
        })();
        if(updateBool) {
            setUpdateBool(false);
        }
    }, [ currentIdState, updateBool ]);


    return (
        <div className='sub-page-content'>
            <div onClick={() => dispatch(resetCurrentId())} className='x-sign' />
            { category ? <>
                <EntityDescriptionTable>
                    <tr><td colSpan={ 2 }>상품 그룹 상세정보</td></tr>
                    <tr><td>상품 그룹명</td><td>{ category.name }</td></tr>
                </EntityDescriptionTable>
                <EntityTable<SetTopBox>
                    tableHeadColumn={ [ <>셋톱박스 UUID</>, [ <>Bounce rate</>, 2 ] ] }
                    getEntityCount={ getSetTopBoxesCount }
                    getEntitiesPage={ getSetTopBoxesPage }
                    entityToJSX={ entityToJSX }
                    selectable={ false }
                />
            </> : <>
                Loading...
            </> }
        </div>
    )
}

const ProductCategoryList : React.FC = () => {

    // redux stuff
    const currentIdState = useAppSelector((state) => state.currentId);

    const entityToJSX : EntityToJSXFunction<ProductCategory> = useCallback(async (category) => {
        // let bounceRate = await getBounceRate({ categoryId, setTopBoxId: setTopBox.id });
        let bounceRate = NaN;
        return [
            <>{ category.name }</>,
            <>{ bounceRate }%</>
        ]
    }, []);

    return <>
        <div className='sub-page-content'>
            <Title>상품 그룹 목록</Title>
            <EntityTable<ProductCategory>
                tableHeadColumn={ [ <>상품 그룹명</>, <>Bounce rate 값</> ] }
                getEntityCount={ getCategoriesCount }
                getEntitiesPage={ getCategoriesPage }
                entityToJSX={ entityToJSX }
                selectable={ true }
            />
        </div>
        {typeof currentIdState.id !== 'undefined' ? <ProductCategoryInformation /> : <></>}
    </>
}

export default ProductCategoryList;