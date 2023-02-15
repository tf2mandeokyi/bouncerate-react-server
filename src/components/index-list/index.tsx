import React from 'react'
import { useLocation } from 'react-router-dom'

import './index.scss'


const IndexItem : React.FC<{ name: string, path: string }> = ({ name, path }) => {
    const location = useLocation();
    const selected = location.pathname === path;

    return (
        <div 
            className={ `index-item ${selected ? 'selected' : ''}` }
            onClick={ selected ? undefined : (() => window.location.href = path) }
        >
            { name }
        </div>
    )
}

const IndexList : React.FC = () => {

    return (
        <div className='index-list'>
            <IndexItem name='홈쇼핑 광고 편성표' path='/' />
            <IndexItem name='상품 그룹 목록' path='/categories' />
            <IndexItem name='셋톱박스 목록' path='/setTopBoxes' />
        </div>
    )
}
export default IndexList;