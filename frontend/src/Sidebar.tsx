import { ChevronFirst, ChevronLast } from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    toggle: any;
    countryName: string;
}

const Sidebar = ({ isOpen, toggle, countryName }: SidebarProps) => {

    return (
        <div className="relative w-full h-screen flex">
            <div className={`h-full transition-all ${isOpen ? "w-100" : "w-0"} z-1`}>
                <div className={`h-full flex-col bg-white border-r border-gray-300 shadow-lg overflow-y-scroll`}
                    style={{ scrollbarWidth: "thin" }}>

                    <div className={`border-t flex ${isOpen ? "pt-3 pl-3 pr-3" : "p-0"}`}>
                        <div className={`
                    flex justify-center p-4 items-center overflow-hidden transition-all ${isOpen ? "w-100 ml-3" : "w-0"}`}>
                            <span className={`text-2xl text-black font-semibold overflow-hidden transition-all ${isOpen ? "w-full" : "w-0"} `}>{countryName}</span>
                        </div>
                    </div>

                    <div className={`h-70 flex justify-center items-center overflow-hidden ${isOpen ? "w-full pt-4 pb-4 pl-8 pr-8" : "w-0 p-0"}`}>
                        <div className={`bg-gray-400 rounded-md h-full overflow-hidden ${isOpen ? "w-full p-6" : "w-0 p-0"}`}>Chart 1</div>
                    </div>

                    <div className={`h-70 flex justify-center items-center overflow-hidden ${isOpen ? "w-full pt-4 pb-4 pl-8 pr-8" : "w-0 p-0"}`}>
                        <div className={`bg-gray-400 rounded-md h-full overflow-hidden ${isOpen ? "w-full p-6" : "w-0 p-0"}`}>Chart 2</div>
                    </div>

                    <div className={`h-70 flex justify-center items-center overflow-hidden ${isOpen ? "w-full pt-4 pb-4 pl-8 pr-8" : "w-0 p-0"}`}>
                        <div className={`bg-gray-400 rounded-md h-full overflow-hidden ${isOpen ? "w-full p-6" : "w-0 p-0"}`}>Chart 3</div>
                    </div>
                </div>
            </div>

            <div className="absolute top-1/2 -translate-y-[100%] bg-transparent h-[5%] rounded-lg flex">
                <div className={`bg-transparent h-full overflow-hidden transition-all ${isOpen ? "w-100" : "w-0"}`}></div>
                <button className={`position: relative rounded-r-lg h-15 text-bold text-gray-500 bg-white border-l-[#e3e3e3] cursor-pointer p-1 transition-all 
             shadow-[0_1px_2px_rgba(60,64,67,0.3),0_2px_6px_2px_rgba(60,64,67,0.15)] z-[-1]`}
                    onClick={toggle}>
                    {isOpen ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
                </button>
            </div>
        </div>

    );
};

export default Sidebar;