import {MultiSelect} from "@mantine/core";

type MultiFilterProps = {
    label: string;
    placeholder?: string;
    value: string[];
    onChange: (value: string[]) => void;
    data: Record<string, string>;
    searchable?: boolean;
    clearable?: boolean;
};

export default function MultiFilter({
                                        label,
                                        placeholder = "Sélectionner...",
                                        value,
                                        onChange,
                                        data,
                                        searchable = true,
                                        clearable = true,
                                    }: MultiFilterProps) {
    const options = Object.entries(data).map(([val, label]) => ({
        value: val,
        label,
    }));

    return (
        <MultiSelect
            label={label}
            placeholder={placeholder}
            data={options}
            value={value}
            onChange={onChange}
            searchable={searchable}
            clearable={clearable}
            nothingFoundMessage="Aucun résultat"
        />
    );
}
