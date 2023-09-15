import React from 'react';

// Utils
import { useViewContext } from '../utils/ViewContext';

const PageRender: React.FC = () => {
    const pageContext = useViewContext();
    return (
        <>
            {pageContext.page}   
        </>
    )
};

export default PageRender;