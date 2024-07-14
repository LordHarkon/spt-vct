import { DependencyContainer } from "tsyringe";

import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { DatabaseService } from "@spt/services/DatabaseService";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import configuration from "../config";

class Mod implements IPostDBLoadMod
{
    public postDBLoad(container: DependencyContainer): void
    {
        // get database from server
        const databaseService = container.resolve<DatabaseService>("DatabaseService");
        const logger = container.resolve<ILogger>("WinstonLogger");

        // Get all the in-memory json found in /assets/database
        const tables: IDatabaseTables = databaseService.getTables();

        // Get all the hideout areas
        const areas = tables.hideout.areas;

        areas.forEach((area) =>
        {
            Object.keys(area.stages).forEach((stageKey) =>
            {
                // Stage is a level of a part of the hideout such as the generator 1, generator 2, etc.
                const stage = area.stages[stageKey];

                // Change the construction time of the stage if it's not 0
                if (stage.constructionTime > 0)
                {
                    // Calculate the new construction time
                    const newTime = Math.round(stage.constructionTime * configuration.hideoutConstructionMultiplier / 100);

                    stage.constructionTime = newTime;
                }
            })
        })

        // Log the changes
        logger.logWithColor(
            `[VariableConstructionTime] Changed the construction time of the hideout stages to: ${configuration.hideoutConstructionMultiplier}% of the original time.`,
            LogTextColor.GREEN
        );
    }
}

export const mod = new Mod();
