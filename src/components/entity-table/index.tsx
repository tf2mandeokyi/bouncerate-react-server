import { useCallback, useEffect, useState } from 'react'
import { ArrayOrSelf, PromiseOrSelf } from '../../utils/types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setCurrentId } from '../../redux/currentIdSlice';
import EntityTablePageNumbers from './page-numbers'

import './index.scss'


type Entity = { id: number };
export type UpdatableSupplierOrSelf<T> = T | ((update: () => void) => T);
export type EntityToJSXFunction<T extends Entity> = (entity: T, update: () => void) => PromiseOrSelf<ArrayOrSelf<JSX.Element>>;
export type TableHeadColumns = ArrayOrSelf<JSX.Element | [ JSX.Element, number ]>;

    
type Props<T extends Entity> = {
    mode?: any;
    tableHeadColumn: UpdatableSupplierOrSelf<TableHeadColumns>;
    selectable: boolean,
    getEntityCount: () => Promise<number>;
    getEntitiesPage: (elementPerPage: number, pageNumber: number) => Promise<T[]>;
    entityToJSX: EntityToJSXFunction<T>;
}


function getCellsFromHeadColumn(tableHeadColumn: UpdatableSupplierOrSelf<TableHeadColumns>, update: () => void) {
    let headColumn = typeof tableHeadColumn === 'function' ? tableHeadColumn(update) : tableHeadColumn;
    if(!(headColumn instanceof Array)) headColumn = [ headColumn ];
    return headColumn.map(c => c instanceof Array ? <td colSpan={ c[1] }>{ c[0] }</td> : <td>{ c }</td>)
}


const EntityTable = <T extends Entity>({ 
    mode, tableHeadColumn, selectable,
    getEntityCount, getEntitiesPage, entityToJSX
}: Props<T>) => {

    const [ doUpdate, setDoUpdate ] = useState<boolean>(false);
    const [ pageNumber, setPageNumber ] = useState<number>(1);
    const [ entityCount, setEntityCount ] = useState<number>(0);
    const [ tableRows, setTableRows ] = useState<JSX.Element[] | undefined>(undefined);

    // redux stuff
    const currentIdState = useAppSelector((state) => state.currentId);
    const dispatch = useAppDispatch();

    // TODO: make this changeable
    const ELEMENT_PER_PAGE = 6;

    const update = useCallback(() => {
        setDoUpdate(true);
    }, []);
    const columnHeadCells = getCellsFromHeadColumn(tableHeadColumn, update);


    const getEntities = useCallback(async () => {
        return {
            count: await getEntityCount(), 
            list: await getEntitiesPage(ELEMENT_PER_PAGE, pageNumber) 
        };
    }, [ pageNumber, getEntityCount, getEntitiesPage ]);


    const setTable = useCallback(async () => {
        let { count, list } = await getEntities();
        if (doUpdate) setDoUpdate(false);

        setEntityCount(count);
        
        let result : JSX.Element[] = [];
        for(let element of list) {
            let jsx = entityToJSX(element, update);
            if(jsx instanceof Promise) jsx = await jsx;
            if(!(jsx instanceof Array)) jsx = [ jsx ];

            let additionalCells = jsx.map((j, i) => <td key={ `tr-${element.id}-td-${i}` }>{ j }</td>)
            let className: string | undefined;
            if(selectable) {
                className = currentIdState.id === element.id ? 'selected' : 'clickable';
            }

            result.push(
                <tr
                    key={ `tr-${element.id}` }
                    onClick={ selectable ? (() => dispatch(setCurrentId(element.id))) : undefined }
                    className={ className }
                >
                    { additionalCells }
                </tr>
            )
        }
        setTableRows(result);

    }, [ getEntities, entityToJSX, setEntityCount, update, dispatch, doUpdate, currentIdState, selectable ])


    useEffect(() => { setTable() }, [ setTable ]);
    useEffect(() => { setPageNumber(1) }, [ mode ])


    return (
        <div className='entity-table-div'>
            <table className={ `entity-table` }>
                <thead>
                    <tr>{ columnHeadCells }</tr>
                </thead>
                <tbody>
                    { tableRows ?? <tr><td colSpan={ 999 } className='loading'>Loading...</td></tr> }
                </tbody>
            </table>
            { tableRows ?
            <EntityTablePageNumbers 
                min={ 1 } 
                max={ Math.ceil(entityCount / ELEMENT_PER_PAGE) } 
                current={ pageNumber } 
                callback={ setPageNumber }
            /> : <></> }
        </div>
    )
}

export default EntityTable