import "./styles/profile.css"
import HomeRow from "../components/HomeRow.tsx";
import {supabaseClient} from "../util/supabaseClient.ts";
import {useEffect, useState} from "react";
import type {User} from "@supabase/supabase-js";
import ClimbElement from "../components/ClimbElement.tsx";
import './styles/profile.css'
import {BACKEND_URL} from "../lib/types.ts";
import {climbsToCsv, downloadCsv} from "../util/exportCsv.ts";
import {toast, ToastContainer} from "react-toastify";

export default function Profile() {
    const [user, setUser] = useState<User>();
    const [climbs, setClimbs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
            const fetchUser = async () => {
                const {data: {user}} = await supabaseClient.auth.getUser();
                if (!user) {
                    setLoading(false);
                    return;
                }
                setUser(user);
                setLoading(true);
                const response = await fetch(`${BACKEND_URL}/climbs/logged/${user.id}`);
                const data = await response.json();
                if (data.success) setClimbs(data.data);
                setLoading(false);
                console.log("sdfa", climbs);
            }
            fetchUser();
        }, []
    );

    useEffect(() => {
        if (!user?.id) return;

        const fetchClimbs = async () => {
            setLoading(true);
            const response = await fetch(`${BACKEND_URL}/climbs/logged/${user.id}`);
            const data = await response.json();
            if (data.success) setClimbs(data.data);
            setLoading(false);
            console.log("sdfa", climbs);
        }
        fetchClimbs();
    }, [user]);

    const avatarUrl = user?.user_metadata?.avatar_url;
    const userName = user?.user_metadata?.name;

    const handleExport = () => {
        if (climbs.length === 0) {
            toast.error("No climbs to export", {autoClose: 2500});
            return;
        }
        const csv = climbsToCsv(climbs);
        const stamp = new Date().toISOString().slice(0, 10);
        const safeName = (userName ?? "climbs").toString().replace(/[^a-z0-9_-]+/gi, "_");
        downloadCsv(`${safeName}_climbs_${stamp}.csv`, csv);
        toast("Exported climbs to CSV", {autoClose: 2500});
    };

    return (<>
            <div className={'profile-page'}>

                <div className={'heading'}>
                    <div className={'user-info'}>
                        <img className={"profile-picture"} src={avatarUrl} alt={"user's profile picture"}/>
                        <h1>{userName}</h1>
                    </div>
                    <button
                        className={"export-climbs-button"}
                        onClick={handleExport}
                        disabled={loading || climbs.length === 0}
                    >
                        Export my climbs
                    </button>
                    <h1 className={"completed-climbs"}>Completed Climbs</h1>
                </div>

                <div className={'logged-climbs'}>

                    <div className={"climbs-profile"}>
                        {climbs.length > 0 ? (climbs.map((climb) => (
                                <ClimbElement key={climb.id} climbId={climb.id} jsonClimb={climb.climbs} onLog={() => {
                                }} isSelected={false}/>
                            ))
                        ) : (loading ? (<p>Loading...</p>) : (<p>No climbs found</p>))}
                    </div>
                </div>

            </div>
            <ToastContainer className={'toast'}/>
            <HomeRow/>
        </>
    );
}