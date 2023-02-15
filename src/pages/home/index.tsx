import React, { useState } from 'react'
import Title from '../../components/title';
import MainPageScheduleTable from './schedule-table';

import './index.scss'


const Home : React.FC = () => {

    const [ minBounceRate, setMinBounceRate ] = useState<number>(0);
    const [ maxBounceRate, setMaxBounceRate ] = useState<number>(30);


    return (
        <div className='page-content'>
            <Title>홈쇼핑 광고 편성표</Title>
            <div className='non-table'>
                <div className='expected-br-span'>예상 Bounce rate: N/A%</div>
                <div className='br-control'>
                    <div className='control-item'>
                        Bounce rate 구간 조정
                        <div>
                            <input 
                                type='number' value={ minBounceRate } 
                                onChange={ e => setMinBounceRate(parseInt(e.target.value)) }
                            /> % ~
                            <input
                                type='number' value={ maxBounceRate }
                                onChange={ e => setMaxBounceRate(parseInt(e.target.value)) }
                            /> %
                        </div>
                    </div>
                </div>
            </div>
            <MainPageScheduleTable bounceRateRange={{
                min: minBounceRate, max: maxBounceRate
            }}/>
        </div>
    )
}

export default Home;