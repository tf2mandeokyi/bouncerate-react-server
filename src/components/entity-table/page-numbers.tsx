import React, { useEffect, useState } from 'react'

import './page-numbers.scss'


interface PageNumberProps {
    page: number; 
    message?: string;
    callback?: (page: number) => void;
}
const Page : React.FC<PageNumberProps> = ({ page, message, callback }) => {
    return (
        <div 
            className='page-number' 
            onClick={ callback ? () => callback(page) : () => {} }
        >
            { message ?? page }
        </div>
    )
}


type Props = {
    min: number;
    current: number;
    max: number;
    callback: (page: number) => void;
}
const EntityTablePageNumbers : React.FC<Props> = (props) => {

    const [ leftPages, setLeftPages ] = useState<JSX.Element[]>();
    const [ centerPage, setCenterPage ] = useState<JSX.Element>();
    const [ rightPages, setRightPages ] = useState<JSX.Element[]>();

    useEffect(() => {
        let { min, max, current, callback } = props;
        let leftResult : JSX.Element[] = [], rightResult : JSX.Element[] = [];

        /* Examples:
            0   1    2    3    4    5    6    7    8    9    10   11  12
                Back [1 ] [..] [4 ] [5 ] [6!] [7 ] [8 ] [..] [99] Next
                Back      [1 ] [2 ] [3 ] [4!] [5 ] [6 ] [..] [99] Next
        */

        let cm = current - min, mc = max - current;

        // 0
        leftResult.push(<div></div>)

        // 1
        if(cm >= 4) leftResult.push(<Page page={ current - 3 } message='Prev' callback={ callback }/>)
        else leftResult.push(<div></div>)

        // 2
        if(cm >= 4) leftResult.push(<Page page={ min } callback={ callback }/>)
        else leftResult.push(<div></div>)

        // 3
        if(cm >= 4) leftResult.push(<div>...</div>)
        else if(cm === 3) leftResult.push(<Page page={ min } callback={ callback }/>)
        else leftResult.push(<div></div>)

        // 4
        if(cm >= 2) leftResult.push(<Page page={ current - 2 } callback={ callback }/>)
        else leftResult.push(<div></div>)

        // 5
        if(cm >= 1) leftResult.push(<Page page={ current - 1 } callback={ callback }/>)
        else leftResult.push(<div></div>)

        setLeftPages(leftResult);

        // 6
        setCenterPage(<Page page={ current }/>)

        // 7
        if(mc >= 1) rightResult.push(<Page page={ current + 1 } callback={ callback }/>)
        else rightResult.push(<div></div>)

        // 8
        if(mc >= 2) rightResult.push(<Page page={ current + 2 } callback={ callback }/>)
        else rightResult.push(<div></div>)

        // 9
        if(mc >= 4) rightResult.push(<div>...</div>)
        else if(mc === 3) rightResult.push(<Page page={ max } callback={ callback }/>)
        else rightResult.push(<div></div>)

        // 10
        if(mc >= 4) rightResult.push(<Page page={ max } callback={ callback }/>)
        else rightResult.push(<div></div>)

        // 11
        if(mc >= 4) rightResult.push(<Page page={ current + 3 } message='Next' callback={ callback }/>)
        else rightResult.push(<div></div>)

        // 12
        rightResult.push(<div></div>)

        setRightPages(rightResult)

    }, [ props ])

    return (
        <div className='page-numbers'>
            <div className='left'>{ leftPages }</div>
            <div className='center'>{ centerPage }</div>
            <div className='right'>{ rightPages }</div>
        </div>
    )
}

export default EntityTablePageNumbers