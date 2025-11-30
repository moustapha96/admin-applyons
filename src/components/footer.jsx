export default function Footer(){
    return(
        <footer>
           <div className="shadow-sm dark:shadow-gray-700 bg-white dark:bg-slate-900 px-6 py-4">
                <div className="container-fluid">
                     <div className="grid grid-cols-1">
                        <div className="sm:text-start text-center mx-md-2">
                            <p className="mb-0  text-sm text-[var(--applyons-orange)]">© {(new Date().getFullYear())} applyons</p>
                        </div>
                     </div>
                    
                </div>
           </div>
        </footer>
    )
}