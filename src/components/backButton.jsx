import { Link } from "react-router-dom";

import * as Icon from 'react-feather'

export default function BackButton(){
    return(
        <>
         <div className="fixed bottom-3 end-3">
            <Link to="/" className="back-button size-9 inline-flex items-center justify-center tracking-wide border align-middle duration-500 text-base text-center bg-[var(--applyons-blue)] hover:bg-indigo-700 border-[var(--applyons-blue)] hover:border-indigo-700 text-white rounded-full"><Icon.ArrowLeft className="size-4"/></Link>
        </div>
        </>
    )
}