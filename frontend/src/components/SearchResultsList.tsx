import { useEffect, useRef } from "react";

interface SearchResultsListProps {
    focusedIndex: number;
    setFocusedIndex: (index: number) => void;
    autocompleteResults: any;
    handleSelection: (selectedIndex: number) => void;
}

export const SearchResultsList = ({ handleSelection, focusedIndex, setFocusedIndex, autocompleteResults }: SearchResultsListProps) => {
    const resultContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!resultContainer.current) return;

        resultContainer.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest"
        });
    }, [focusedIndex]);

    return (
        <div className="absolute w-full rounded-b-lg bg-[#d0a4b4] max-h-[49vh] overflow-x-hidden overflow-y-auto pb-2">
            <div className={`h-0 border-[rgb(232,234,237)] border-t-[1px] ml-4 mr-4 pb-1`}></div>
            {autocompleteResults.map((item: any, index: number) => {
                return (
                    <div onMouseDown={() => handleSelection(index)}
                        onMouseEnter={() => setFocusedIndex(index)}
                        ref={index === focusedIndex ? resultContainer : null}
                        style={{
                            whiteSpace: "nowrap",
                            justifyContent: 'space-between',
                            backgroundColor: index === focusedIndex ? "rgba(0,0,0,0.1)" : ""
                        }}
                        key={index}
                        className={`flex text-black w-full pt-1 pb-1 pl-3 hover:bg-[rgba(0,0,0,0.1)] hover:cursor-default pr-3`}>
                        <div className='flex justify-centre'>
                            <span className="font-bold">
                                {item.name.length > 30 ? item.name.substring(0, 30) + "..." : item.name}
                            </span>
                            {item.type == 'song' &&
                                <div style={{ color: '#330033' }}>&nbsp;- {item.artist_name}</div>
                            }
                        </div>

                        <div style={{ color: 'white' }}>{item.type}</div>
                    </div>
                );
            })}
        </div>
    )
}
