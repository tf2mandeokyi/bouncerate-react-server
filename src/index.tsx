import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Home from './pages/home'
import ProductCategoryMenu from './pages/product-category'
import SetTopBoxMenu from './pages/set-top-box'
import IndexList from './components/index-list';
import { store } from './redux/store';

import './index.scss';


const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <Provider store={ store }>
        <BrowserRouter>
            <div className='navbar'/>
            <div className='non-nav'>
                <IndexList/>
                <div className='main'>
                    <Routes>
                        <Route index element={ <Home /> } />
                        <Route path='/categories' element={ <ProductCategoryMenu /> } />
                        <Route path='/setTopBoxes' element={ <SetTopBoxMenu /> } />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    </Provider>
);