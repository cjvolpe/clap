export interface Climb {
    name: string;
    difficulty: string;
    type: string;
    color: Color;
    setter: string;
    dateSet: Date;
    gym: string;
    picture: string;
    archived: boolean;
    claimed: boolean;

}

export interface Color{
    name: string;
    hex: string;
}

export interface Success<T> {
    success: true;
    data: T;
}

export interface Failure{
    success: false;
    error: Error;
    code?: number;
}

export interface SuccessReply<T>{
    success: true;
    data: T;
}
export interface FailureReply{
    success: false;
    error: string;
    message: string;
}

export type BaseReply<T> = SuccessReply<T> | FailureReply;
export type Process<T> = Success<T> | Failure;
export type Task = Process<void>;

export interface ReplyConfig<T>{
    reply: BaseReply<T>;
    code: number;
}