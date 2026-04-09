// builtin

// external
import type {FastifyInstance} from "fastify";
import type {BaseReply, Failure, ReplyConfig, Task, Process, Climb} from "../../frontend/src/lib/types.ts";
import * as url from "node:url";

// internal


const exampleFilters: Record<string, any> = {
    // search: "",
    // color: "Red",
    type: "Top Rope"
}
//TODO: add post request for claiming a set climb, and ticking a climb
export function setupRoutes(server: FastifyInstance) {
    server.get<{
        Reply: any[] | { error: string };
    }>("/featured", async (request, reply) => {
        // for (const key in exampleFilters) {
        //     query = query.eq(key, exampleFilters[key])
        // }

        const {reply: result, code} = await packageResponse(() => handleFeaturedClimbs());

        return reply.status(code).send(result);
    });
    server.post<{
        Body: Climb;
        Reply: BaseReply<void>;

    }>("/climbs", async (req, res) => {
        const {reply, code} = await packageResponse(() => handleNewClimb(req.body));
        res.status(code).send(reply);
    });

    server.patch('/climbs/archive/:id', async (req, res) => {
        const {reply, code} = await packageResponse(() => handleArchive(req.params));
        res.status(code).send(reply);

    })

    async function handleFeaturedClimbs(): Promise<Task> {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const query = server.supabase.from("climbs")
            .select("*").gte('date_set', twoWeeksAgo.toISOString()).order("date_set", {ascending: false});
        const {data, error} = await query;
        if (error) {
            return {success: false, error: error, code: 500};
        }
        return {success: true, data: data};

    }
//TODO: Handle pictures & fix date for postman
    async function handleNewClimb(req: Climb): Promise<Task> {
        const {name, difficulty, type, color, setter, dateSet, gym} = req;
        const {data, error} = await server.supabase.from("climbs").insert([
            {
                name: name,
                difficulty: difficulty,
                type: type,
                color: color,
                setter: setter,
                date_set: dateSet,
                gym: gym,
            }
        ]).select();
        if (error) {
            return {success: false, error: error, code: 500};
        }
        return {success: true, data: data};
    }

    async function handleArchive(params:{id?: string}): Promise<Task> {
        const {id} = params;
        const {data, error} = await server.supabase.from("climbs").update({archived: true}).eq("id",id).select();
        if (error) {
            return {success: false, error: error, code: 500};
        }
        return {success: true, data: data};

    }


    async function packageResponse<O>(handler: () => Promise<Process<O>>,): Promise<ReplyConfig<O>> {
        const result = await handler();

        if (result.success) {
            return {
                reply: {...result},
                code: 200
            };
        }

        if (result.code !== undefined) {
            return {
                reply: {
                    success: false,
                    error: result.error.message,
                    message: result.error.message,
                },
                code: result.code
            };
        }

        throw result.error;

    }

//TODO: Replace schema with a getter in the frontend
//     server.get<{
//         Reply: any[] | { error: string };
//     }>("/climb",{schema:{querystring:{properties:{}}}, async (request, reply) => {
//         let query = server.supabase.from("climbs").select('*');
//         const {data, error} = await query;
//         if (error) {
//             return reply.status(500).send(error);
//         }
//         return data;
//     });
    // server.post<{
    //     Body: Task;
    // }>("/task", async (request, reply) => {
    //     const {name, description, dueDate} = request.body;
    //     const {data, error} = await server.supabase.from("task").insert([{
    //         task_name: name,
    //         description: description,
    //         due_date: dueDate
    //     }]).select();
    //
    //     if (error) {
    //         return reply.status(500).send(error);
    //     }
    //     return reply.status(201).send(data);
    // });
}