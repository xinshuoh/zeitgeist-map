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
        const selectedName = selectedItem.name
        onSelect && onSelect(selectedName);
        setInput(selectedName);

        // Open focus view for song or artist
        if (selectedItem.type == "song") {
            // song focus views just require song name and artist name, they get the rest from there
            setFocusOptions({ song: {song_name: selectedName, artist: selectedItem.artist_name, genres: selectedItem.genres}, isOpen: true, type: 'song', countryCode: 'gb', countryName: 'Great Britain' });
        } else if (selectedItem.type == "artist") {
            // only artist name
            setFocusOptions({ artist: selectedName, isOpen: true, type: 'artist', countryCode: 'gb', countryName: 'Great Britain' });
        }
        
        
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
            className="h-full self-start flex-row items-center relative z-2 outline-none">
            <input type="text" list="search-autocomplete"
                className={`w-[40vw] min-w-120 p-2 bg-[#e0a7bb] text-center text-black cursor-text outline-none
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
