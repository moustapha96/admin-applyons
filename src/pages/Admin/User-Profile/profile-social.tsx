import {useEffect} from "react";

import backgroundImage from '../../assets/images/blog/bg.jpg'

import UserProfileTab from "../../components/userProfileTab";

import * as Icon from 'react-feather'

export default function ProfileSocial(){

    useEffect(() => {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
    }, []);

    return(
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
                        <div className="relative rounded-md shadow-sm dark:shadow-gray-700 bg-white dark:bg-slate-900">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h5 className="text-lg font-semibold">Social Profiles :</h5>
                            </div>

                            <div className="p-6">
                                <div className="md:flex">
                                    <div className="md:w-1/3">
                                        <span className="font-medium">Twitter</span>
                                    </div>

                                    <div className="md:w-2/3 mt-4 md:mt-0">
                                        <form>
                                            <div className="form-icon relative">
                                                <Icon.Twitter className="size-4 absolute top-3 start-4"/>
                                                <input type="text" className="form-input ps-12 w-full py-2 px-3 h-10 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-200 focus:border-[var(--applyons-blue)] dark:border-gray-800 dark:focus:border-[var(--applyons-blue)] focus:ring-0" placeholder="Twitter Profile Name" id="twitter_name" name="name"/>
                                            </div>
                                        </form>

                                        <p className="text-slate-400 mt-1">Add your Twitter username (e.g. jennyhot).</p>
                                    </div>
                                </div>
                                
                                <div className="md:flex mt-8">
                                    <div className="md:w-1/3">
                                        <span className="font-medium">Facebook</span>
                                    </div>

                                    <div className="md:w-2/3 mt-4 md:mt-0">
                                        <form>
                                            <div className="form-icon relative">
                                                <Icon.Facebook  className="size-4 absolute top-3 start-4"/>
                                                <input type="text" className="form-input ps-12 w-full py-2 px-3 h-10 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-200 focus:border-[var(--applyons-blue)] dark:border-gray-800 dark:focus:border-[var(--applyons-blue)] focus:ring-0" placeholder="Facebook Profile Name" id="facebook_name" name="name"/>
                                            </div>
                                        </form>

                                        <p className="text-slate-400 mt-1">Add your Facebook username (e.g. jennyhot).</p>
                                    </div>
                                </div>
                                
                                <div className="md:flex mt-8">
                                    <div className="md:w-1/3">
                                        <span className="font-medium">Instagram</span>
                                    </div>

                                    <div className="md:w-2/3 mt-4 md:mt-0">
                                        <form>
                                            <div className="form-icon relative">
                                                <Icon.Instagram className="size-4 absolute top-3 start-4"/>
                                                <input type="text" className="form-input ps-12 w-full py-2 px-3 h-10 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-200 focus:border-[var(--applyons-blue)] dark:border-gray-800 dark:focus:border-[var(--applyons-blue)] focus:ring-0" placeholder="Instagram Profile Name" id="insta_name" name="name"/>
                                            </div>
                                        </form>

                                        <p className="text-slate-400 mt-1">Add your Instagram username (e.g. jennyhot).</p>
                                    </div>
                                </div>
                                
                                <div className="md:flex mt-8">
                                    <div className="md:w-1/3">
                                        <span className="font-medium">Linkedin</span>
                                    </div>

                                    <div className="md:w-2/3 mt-4 md:mt-0">
                                        <form>
                                            <div className="form-icon relative">
                                                <Icon.Linkedin className="size-4 absolute top-3 start-4"/>
                                                <input type="text" className="form-input ps-12 w-full py-2 px-3 h-10 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-200 focus:border-[var(--applyons-blue)] dark:border-gray-800 dark:focus:border-[var(--applyons-blue)] focus:ring-0" placeholder="Linkedin Profile Name" id="linkedin_name" name="name"/>
                                            </div>
                                        </form>

                                        <p className="text-slate-400 mt-1">Add your Linkedin username.</p>
                                    </div>
                                </div>
                                
                                <div className="md:flex mt-8">
                                    <div className="md:w-1/3">
                                        <span className="font-medium">Youtube</span>
                                    </div>

                                    <div className="md:w-2/3 mt-4 md:mt-0">
                                        <form>
                                            <div className="form-icon relative">
                                                <Icon.Youtube className="size-4 absolute top-3 start-4"/>
                                                <input type="url" className="form-input ps-12 w-full py-2 px-3 h-10 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-200 focus:border-[var(--applyons-blue)] dark:border-gray-800 dark:focus:border-[var(--applyons-blue)] focus:ring-0" placeholder="Youtube url" id="you_url" name="url"/>
                                            </div>
                                        </form>

                                        <p className="text-slate-400 mt-1">Add your Youtube url.</p>
                                    </div>
                                </div>

                                <div className="lg:flex">
                                    <div className="lg:w-1/3">
                                        <button className="py-2 px-5 inline-block font-semibold tracking-wide border align-middle duration-500 text-base text-center bg-[var(--applyons-blue)] hover:bg-indigo-700 border-[var(--applyons-blue)] hover:border-indigo-700 text-white rounded-md mt-5">Save Social Profile</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}