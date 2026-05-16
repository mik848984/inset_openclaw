import winston, {Logger} from "winston";

interface ILogJson {
    level: string,
    message: string,
    json: any
}

export const loggerService = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(),
        winston.format.metadata()
    ),
    transports: [
        new winston.transports.File({filename: 'error.log', level: 'error'}),
        new winston.transports.File({filename: 'combined.log'}),
        new winston.transports.Console()
    ],
}) as Logger & { logJSON: (params: ILogJson) => void };

loggerService.logJSON = ({message, level, json}: ILogJson) => {
    loggerService.log({
        level,
        message: `${message} ${JSON.stringify(json, null, 2)}`
    }, )
}
