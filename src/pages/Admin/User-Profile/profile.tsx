import {useState, useEffect} from "react";
import { Link } from "react-router-dom";

import * as Icon from 'react-feather'

import backgroundImage from '../../assets/images/blog/bg.jpg'

import UserProfileTab from "../../components/userProfileTab";

import {Lightbox} from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import { portfolioData, portfolioImage,experienceData } from "../../data/data";
import { AiOutlineCamera } from "react-icons/ai";

export default function Profile(){

    useEffect(() => {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
    }, []);
    
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isOpen, setisOpen] = useState(false);

    const handleImageClick = (index:number) => {
        setCurrentImageIndex(index);
        setisOpen(true);
    };
    const slides = portfolioImage.map((image) => ({ src: image }));

    return(
        <>
        <div className="container-fluid relative px-3">
            <div className="layout-specing">
                <div className="grid grid-cols-1">
                    <div className="profile-banner relative text-transparent rounded-md shadow-sm dark:shadow-gray-700 overflow-hidden">
                        <input id="pro-banner" name="profile-banner" type="file" className="hidden"/>
                        <div className="relative shrink-0">
                            <img src={backgroundImage} className="h-80 w-full object-cover" id="profile-banner" alt=""/>
                            <div className="absolute inset-0 bg-slate-900/70"></div>
                            <label className="absolute inset-0 cursor-pointer" htmlFor="pro-banner"></label>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-12 grid-cols-1">
                    <UserProfileTab/>
                    <div className="xl:col-span-9 lg:col-span-8 md:col-span-8 mt-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="p-6 relative rounded-md shadow-sm dark:shadow-gray-700 bg-white dark:bg-slate-900">
                                <h5 className="text-xl font-semibold">Cristina Murfy</h5>
                    
                                <p className="text-slate-400 mt-3">I have started my career as a trainee and prove my self and achieve all the milestone with good guidance and reach up to the project manager. In this journey, I understand all the procedure which make me a good developer, team leader, and a project manager.</p>
                            </div>

                            <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
                                <div className="p-6 relative rounded-md shadow-sm dark:shadow-gray-700 bg-white dark:bg-slate-900 h-fit">
                                    <h5 className="text-xl font-semibold">Personal Details :</h5>
                                    <div className="mt-6">
                                        <div className="flex items-center">
                                            <Icon.Mail className="fea icon-ex-md text-slate-400 me-3"/>
                                            <div className="flex-1">
                                                <h6 className="text-[var(--applyons-blue)] dark:text-white font-medium mb-0">Email :</h6>
                                                <Link to="" className="text-slate-400">cristina@hotmail.com</Link>
                                            </div>
                                        </div>
                                        <div className="flex items-center mt-3">
                                            <Icon.Bookmark className="fea icon-ex-md text-slate-400 me-3"/>
                                            <div className="flex-1">
                                                <h6 className="text-[var(--applyons-blue)] dark:text-white font-medium mb-0">Skills :</h6>
                                                <Link to="" className="text-slate-400">html</Link>, <Link to="" className="text-slate-400">css</Link>, <Link to="" className="text-slate-400">js</Link>, <Link to="" className="text-slate-400">mysql</Link>
                                            </div>
                                        </div>
                                        <div className="flex items-center mt-3">
                                            <Icon.Italic className="fea icon-ex-md text-slate-400 me-3"/>
                                            <div className="flex-1">
                                                <h6 className="text-[var(--applyons-blue)] dark:text-white font-medium mb-0">Language :</h6>
                                                <Link to="" className="text-slate-400">English</Link>, <Link to="" className="text-slate-400">Japanese</Link>, <Link to="" className="text-slate-400">Chinese</Link>
                                            </div>
                                        </div>
                                        <div className="flex items-center mt-3">
                                            <Icon.Globe className="fea icon-ex-md text-slate-400 me-3"/>
                                            <div className="flex-1">
                                                <h6 className="text-[var(--applyons-blue)] dark:text-white font-medium mb-0">Website :</h6>
                                                <Link to="" className="text-slate-400">www.cristina.com</Link>
                                            </div>
                                        </div>
                                        <div className="flex items-center mt-3">
                                            <Icon.Gift className="fea icon-ex-md text-slate-400 me-3"/>
                                            <div className="flex-1">
                                                <h6 className="text-[var(--applyons-blue)] dark:text-white font-medium mb-0">Birthday :</h6>
                                                <p className="text-slate-400 mb-0">2nd March, 1996</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center mt-3">
                                            <Icon.MapPin className="fea icon-ex-md text-slate-400 me-3"/>
                                            <div className="flex-1">
                                                <h6 className="text-[var(--applyons-blue)] dark:text-white font-medium mb-0">Location :</h6>
                                                <Link to="" className="text-slate-400">Beijing, China</Link>
                                            </div>
                                        </div>
                                        <div className="flex items-center mt-3">
                                            <Icon.Phone className="fea icon-ex-md text-slate-400 me-3"/>
                                            <div className="flex-1">
                                                <h6 className="text-[var(--applyons-blue)] dark:text-white font-medium mb-0">Cell No :</h6>
                                                <Link to="" className="text-slate-400">(+12) 1254-56-4896</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 relative rounded-md shadow-sm dark:shadow-gray-700 bg-white dark:bg-slate-900 h-fit">
                                    <h5 className="text-xl font-semibold">Experience :</h5>
                                    {experienceData.map((item, index) =>{
                                        return(
                                            <div key={index} className="flex duration-500 hover:scale-105 shadow-sm dark:shadow-gray-700 hover:shadow-md dark:hover:shadow-gray-700 ease-in-out items-center p-4 rounded-md bg-white dark:bg-slate-900 mt-6">
                                                <img src={item.image} className="h-16 w-16 p-4 bg-slate-50 dark:bg-slate-800 shadow-sm dark:shadow-gray-700 rounded-md" alt=""/>
                                                <div className="flex-1 content ms-4">
                                                    <h4 className="text-lg text-medium">{item.title}</h4>
                                                    <p className="text-slate-400 mb-0">{item.experience}</p>
                                                    <p className="text-slate-400 mb-0"><Link to="" className="text-[var(--applyons-blue)]">{item.company}</Link> {item.location}</p>    
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="p-6 relative rounded-md shadow-sm dark:shadow-gray-700 bg-white dark:bg-slate-900">
                                <h5 className="text-xl font-semibold">Portfolio :</h5>
            
                                <div className="grid lg:grid-cols-3 md:grid-cols-2 mt-6 gap-6">
                                    {portfolioData.map((item,index) => {
                                        return(
                                            <div className="group relative block overflow-hidden rounded-md duration-500" key={index}>
                                                <img src={item.image} className="group-hover:origin-center group-hover:scale-110 group-hover:rotate-3 duration-500" alt=""/>
                                                <div className="absolute inset-2 group-hover:bg-white/90 dark:group-hover:bg-slate-900/90 duration-500 z-0 rounded-md"></div>
                    
                                                <div className="content duration-500">
                                                    <div className="icon absolute z-10 opacity-0 group-hover:opacity-100 top-6 end-6 duration-500">
                                                        <Link to="#" onClick={() => handleImageClick(item.id)} className="size-9 inline-flex items-center justify-center tracking-wide align-middle duration-500 text-center bg-[var(--applyons-blue)] hover:bg-indigo-700 border-[var(--applyons-blue)] hover:border-indigo-700 text-white rounded-full lightbox"><AiOutlineCamera/></Link>
                                                    </div>
                    
                                                    <div className="absolute z-10 opacity-0 group-hover:opacity-100 bottom-6 start-6 duration-500">
                                                        <Link to="/portfolio-detail-three" className="h6 text-lg font-medium hover:text-[var(--applyons-blue)] duration-500 ease-in-out">{item.title1}</Link>
                                                        <p className="text-slate-400 mb-0">{item.title2}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <Lightbox
                                        open={isOpen}
                                        close={() => setisOpen(false)}
                                        slides={slides}
                                        index={currentImageIndex} // Show the clicked image first
                                    />
                                </div>  
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}