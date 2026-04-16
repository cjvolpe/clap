import "./styles/profile.css"
import HomeRow from "../components/HomeRow.tsx";
import {supabaseClient} from "../util/supabaseClient.ts";
import {useEffect, useState} from "react";
import type {User} from "@supabase/supabase-js";

export default function Profile() {
    const [user, setUser] = useState<User>();

    useEffect(() => {
        const fetchUser = async () => {
            const {data: {user}} = await supabaseClient.auth.getUser();
            setUser(user);
        }
        fetchUser();
    }, []);
    const avatarUrl = user?.user_metadata?.avatar_url;
    const userName = user?.user_metadata?.name;
    return (<>
            <div className={'home-page'}>

                <p>profile</p>
                <div className={'user-info'}>
                    <img className={"profile-picture"} src={avatarUrl} alt={"user's profile picture"}/>
                    <h1>{userName}</h1>
                </div>
                <div className={'logged-climbs'}>

                </div>
               
            </div>
            <HomeRow/>
        </>
    );
}