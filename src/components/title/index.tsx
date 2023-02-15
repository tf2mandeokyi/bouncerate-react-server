import React from 'react'

import './index.scss'


type Props = {
    children: React.ReactNode;
}

const Title : React.FC<Props> = (props) => {
    return <>
        <div className='page-title'>{ props.children }</div>
    </>
}

export default Title