import React from 'react'
import { ArrayOrSelf } from '../../utils/types'

import './index.scss'


type Props = {
    children: ArrayOrSelf<React.ReactElement>
}

const EntityDescriptionTable : React.FC<Props> = ({ children }) => {
    return (
        <table className='entity-description-table'>
            <thead></thead>
            <tbody>{ children }</tbody>
        </table>
    )
}

export default EntityDescriptionTable