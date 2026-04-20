import {BACKEND_URL, BOULDER_GRADES, ROPE_GRADES, ROUTE_COLORS} from "../lib/types.ts";
import {useEffect, useState} from "react";
import '../pages/styles/filterclimbs.css'

export default function FilterClimbs({filter}) {
    const [type, setType] = useState("Boulder");
    const [upperDifficulty, setUpperDifficulty] = useState("V17");
    const [color, setColor] = useState("Red");
    const [gym, setGym] = useState("Fetzer");
    const [archived, setArchived] = useState<boolean>(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const advancedSearch = async (formData: FormData) => {
        const newFilter = {
            lowerDifficulty: formData.get('lowerDifficulty') as string,
            upperDifficulty: formData.get('upperDifficulty') as string,
            type: formData.get('type') as string,
            color: formData.get('color') as string,
            startDate: formData.get('startDate') as Date,
            endDate: formData.get('endDate') as Date,
            gym: formData.get('gym') as string,
            archived: formData.get('archived') as boolean,
        }
        await fetch(`${BACKEND_URL}/climbs/search/filter`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newFilter),
        });
        console.log(newFilter);
    }
    useEffect(() => {
        setUpperDifficulty(type === "Boulder" ? "V17" : "5.15+");
    }, [type]);


    return (
        <div className={`advanced-search-bar ${filter ? 'show' : 'hidden'}`}>
            <form action={advancedSearch} className={'filter'}>
                <div className={'filter-r1'}>
                    <label>
                        <p>Type</p>
                        <select name="type" onChange={e => setType(e.target.value)} required={true}
                                value={type}>
                            <option value={"Boulder"}>Boulder</option>
                            <option value={"Top Rope"}>Top Rope</option>
                        </select>
                    </label>

                    <label className={"difficulty"}>
                        <p>Difficulty Range</p>
                        <select name="lowerDifficulty" required={true}>
                            {type === "Boulder" ? (Object.keys(BOULDER_GRADES).map((boulder) => (
                                    <option>{boulder}</option>))) :
                                (Object.keys(ROPE_GRADES).map((grade) => (
                                    <option value={grade} key={"filter." + grade}>{grade}</option>)))}
                        </select>
                        to
                        <select name="upperDifficulty" defaultValue={upperDifficulty} value={upperDifficulty}
                                onChange={(e) => setUpperDifficulty(e.target.value)} required={true}>
                            {type === "Boulder" ? (Object.keys(BOULDER_GRADES).map((boulder) => (
                                    <option>{boulder}</option>))) :
                                (Object.keys(ROPE_GRADES).map((grade) => (
                                    <option value={grade} key={"filter." + grade}>{grade}</option>)))}
                        </select>
                    </label>
                </div>
                <div className={'filter-r2'}>
                    <label className={"color"}>
                        <p>Color</p>
                        <select name="color" value={color} onChange={e => setColor(e.target.value)}>
                            {Object.keys(ROUTE_COLORS).map((color) => (
                                <option value={color} key={"filter." + color}>{color}</option>))}
                        </select>
                    </label>
                    <label className={"gym"}>
                        <p>Gym</p>
                        <select name="gym" value={gym} onChange={e => setGym(e.target.value)}>
                            <option value={"Fetzer"}>Fetzer</option>
                            <option value={"Ram's Head"}>Ram's Head</option>
                        </select>
                    </label>
                </div>


                <label className={"dates"}>
                    <p>Dates Set</p>
                    <input
                        type="date"
                        name="startDate"
                        placeholder="Enter Date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                    to
                    <input
                        type="date"
                        name="endDate"
                        placeholder="Enter Date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    />
                </label>


                <label className={'archived-climbs'}>
                    <p>Include Archived Climbs</p>
                    <input name={'archived'} type={"checkbox"} checked={archived}
                           onChange={e => setArchived(e.target.value)}/>
                </label>
                <div className={'advanced-search-bar-buttons'}>
                    <button type="submit">Apply Filters</button>
                    <button type="button" onClick={() => {
                        setType("Boulder");
                        setUpperDifficulty("V17");
                        setColor("Red");
                        setStartDate("");
                        setEndDate("");
                        setGym("Fetzer");
                        setArchived(false);
                    }}>Clear Filters
                    </button>
                </div>

            </form>

        </div>);
}