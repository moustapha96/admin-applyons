import { Link } from "react-router-dom"

import SimpleBarReact from "simplebar-react";
import 'simplebar-react/dist/simplebar.min.css';

import { topProductData } from "../../data/data";
import { HiArrowTrendingDown, HiArrowTrendingUp } from "react-icons/hi2";

export default function TopProduct(){
  
    return(
        <div className="xl:col-span-3 lg:col-span-6">
            <div className="rounded-md shadow-sm dark:shadow-gray-700 bg-white dark:bg-slate-900">
                <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                    <h6 className="text-lg font-semibold">Top Products / Items</h6>

                    <Link to="" className="text-slate-400 hover:text-[var(--applyons-blue)] dark:text-white/70 dark:hover:text-white text-[20px]"><i className="mdi mdi-swap-vertical"></i></Link>
                </div>
                <SimpleBarReact className="relative overflow-x-auto block w-full max-h-[400px]">
                    <div>
                        <table className="w-full text-start">
                            <thead className="text-base">
                                <tr>
                                    <th className="text-start font-semibold text-[15px] p-4 min-w-[150px]">Products</th>
                                    <th className="text-start font-semibold text-[15px] p-4 min-w-[100px]">Earnings</th>
                                    <th className="text-end font-semibold text-[15px] p-4 min-w-[80px]">Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProductData.map((item, index) => {
                                    return(
                                        <tr key={index}>
                                            <th className="text-start border-t border-gray-100 dark:border-gray-800 p-4 font-semibold">{item.title}</th>
                                            <td className="text-start border-t border-gray-100 dark:border-gray-800 p-4">{item.earnings}</td>
                                            <td className="text-end border-t border-gray-100 dark:border-gray-800 p-4">
                                                {item?.Progress ?<span className="text-emerald-600 text-sm ms-1 font-semibold flex items-center"><HiArrowTrendingUp className="me-1"/> {item.Progress}</span> :'' }
                                                {item?.loss ?<span className="text-red-600 text-sm ms-1 font-semibold flex items-center"><HiArrowTrendingDown className="me-1"/> {item.loss}</span> :'' }
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </SimpleBarReact>
            </div>
        </div> 
    )
}