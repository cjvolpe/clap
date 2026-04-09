// builtin

// external
import type {FastifyInstance} from "fastify";
import type {BaseReply, Failure, ReplyConfig, Task, Process, Climb} from "../../frontend/src/lib/types.ts";

// internal


const exampleFilters: Record<string, any> = {
    // search: "",
    // color: "Red",
    type: "Top Rope"
}

export function setupRoutes(server: FastifyInstance) {
    server.get<{
        Reply: any[] | { error: string };
    }>("/newclimbs", async (request, reply) => {
        console.log("request.body = ")
        console.log(request.body);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate()-14);
        let query = server.supabase.from("climbs")
            .select("*").gte({'date_set':twoWeeksAgo});

        // for (const key in exampleFilters) {
        //     query = query.eq(key, exampleFilters[key])
        // }

        const {data, error} = await query;
        if (error) {
            return reply.status(500).send(error);
        }
        return data;
    });
    server.post<{
        Body: Climb;
        Reply: BaseReply<void>;

    }>("/search", async (req, res) => {
        const {reply, code} = await packageResponse(() => handleSearch(req.body));
        res.status(code).send(reply);
    });

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