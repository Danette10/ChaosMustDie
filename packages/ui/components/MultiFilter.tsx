import {MultiSelect} from "@mantine/core";

/**
 * Props for the MultiFilter component.
 *
 * @interface MultiFilterProps
 * @property {string} label - Label displayed above the multi-select input.
 * @property {string} [placeholder="Sélectionner..."] - Placeholder text displayed when no value is selected.
 * @property {string[]} value - Array of selected values.
 * @property {(value: string[]) => void} onChange - Callback function triggered when the selected values change.
 * @property {Record<string, string>} data - Object containing the options for the multi-select, where keys are values and values are labels.
 * @property {boolean} [searchable=true] - Determines if the multi-select input is searchable.
 * @property {boolean} [clearable=true] - Determines if the selected values can be cleared.
 */
type MultiFilterProps = {
    label: string;
    placeholder?: string;
    value: string[];
    onChange: (value: string[]) => void;
    data: Record<string, string>;
    searchable?: boolean;
    clearable?: boolean;
};

/**
 * MultiFilter Component
 *
 * This component renders a multi-select input using Mantine's MultiSelect.
 * It allows users to select multiple options from a list, with support for search and clearing selections.
 *
 * @param {MultiFilterProps} props - Props for the component.
 * @returns {JSX.Element} The rendered multi-select component.
 */
export default function MultiFilter({
                                        label,
                                        placeholder = "Sélectionner...",
                                        value,
                                        onChange,
                                        data,
                                        searchable = true,
                                        clearable = true,
                                    }: MultiFilterProps) {
    // Maps the data object into an array of options for the MultiSelect component.
    const options = Object.entries(data).map(([val, label]) => ({
        value: val,
        label,
    }));

    return (
        <MultiSelect
            label={label} // Sets the label for the multi-select input.
            placeholder={placeholder} // Sets the placeholder text.
            data={options} // Provides the options for the multi-select input.
            value={value} // Sets the currently selected values.
            onChange={onChange} // Attaches the callback for value changes.
            searchable={searchable} // Enables or disables the search functionality.
            clearable={clearable} // Enables or disables the ability to clear selections.
            nothingFoundMessage="Aucun résultat" // Message displayed when no options match the search query.
        />
    );
}