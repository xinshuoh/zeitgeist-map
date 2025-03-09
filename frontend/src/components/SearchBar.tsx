import { useCallback, useEffect, useState } from "react";
import { SearchResultsList } from './SearchResultsList';

interface SearchBarProps {
    autocomplete: any;
    setFocusOptions: any;
    onSelect?: (item: any) => void;
}

export const SearchBar = ({ onSelect, autocomplete, setFocusOptions }: SearchBarProps) => {
    const [input, setInput] = useState<string>("");
    const [autocompleteResults, setAutocompleteResults] = useState<any>([]);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const [showResults, setShowResults] = useState<boolean>(false);

    useEffect(() => {
        if (autocompleteResults.length > 0 && !showResults) setShowResults(true);

        if (autocompleteResults.length <= 0) setShowResults(false);
    }, [autocompleteResults]);

    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
        const { key } = e;
        let nextIndex = 0;

        if (key === "ArrowDown") nextIndex = (focusedIndex + 1) % autocompleteResults.length;
        if (key === "ArrowUp") nextIndex = (focusedIndex - 1 + autocompleteResults.length) % autocompleteResults.length;
        if (key === "Escape") setShowResults(false);
        if (key === "Enter") {
            e.preventDefault();
            handleSelection(focusedIndex);
        }

        setFocusedIndex(nextIndex);
    };

    const handleChange = async (value: React.SetStateAction<string>) => {
        setInput(value);

        if (value == "") {
            setAutocompleteResults([]);
            return;
        }

        var res = await autocomplete(value);
        setAutocompleteResults(res);
        console.log(res);
    };

    const handleSelection = (selectedIndex: number) => {
        const selectedItem = autocompleteResults[selectedIndex];
        if (!selectedItem) resetSearchComplete();
        onSelect && onSelect(selectedItem);
        setInput(selectedItem);

        // Open focus view for song
        setFocusOptions({ song: {song_name: selectedItem}, isOpen: true });
        
        resetSearchComplete();
    };

    const resetSearchComplete = useCallback(() => {
        setFocusedIndex(-1);
        setShowResults(false);
    }, []);

    return (
        <div
            tabIndex={1}
            onKeyDown={handleKeyDown}
            onBlur={resetSearchComplete}
            className="pt-1 h-full self-start flex-row items-center relative z-2 outline-none">
            <input type="text" list="search-autocomplete"
                className={`m-0 w-150 search-button p-2 bg-[#d0a4b4] text-center text-black cursor-text
                    ${showResults ? "rounded-t-lg" : "rounded-lg"} border-[#361836]`}
                placeholder="Search through songs/artists/genres here..."
                value={input}
                onChange={(e) => handleChange(e.target.value)}
            />
            {showResults &&
                <SearchResultsList
                    focusedIndex={focusedIndex}
                    setFocusedIndex={setFocusedIndex}
                    handleSelection={handleSelection}
                    autocompleteResults={autocompleteResults}
                />
            }
        </div>

    )
}
