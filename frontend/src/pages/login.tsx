import { supabaseClient} from "../util/supabaseClient.ts";


export default function LoginPage() {

    async function signInWithGoogle() {
        const {data, error} = await supabaseClient.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: "/home"
            }
        })

        if (error) console.log(error);
        return data;
    }

    return (
        <>
            <div className="login-page">
                <h1>sign in</h1>
                <button onClick={signInWithGoogle}>Continue with google</button>
            </div>
        </>);
}