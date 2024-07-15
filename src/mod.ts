import { DependencyContainer } from "tsyringe";

import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { DatabaseService } from "@spt/services/DatabaseService";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import configuration from "../config.json";

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

        // Array for changes to log
        const changes = [];

        areas.forEach((area) =>
        {
            Object.keys(area.stages).forEach((stageKey) =>
            {
                // Stage is a level of a part of the hideout such as the generator 1, generator 2, etc.
                const stage = area.stages[stageKey];

                // Change the construction time of the stage if it's not 0
                if (stage.constructionTime > 0)
                {
                    // Extract the current construction time
                    let constructionTime = stage.constructionTime;

                    // Check if the area has a multiplier
                    const configArea = configuration.buildings.find((configArea) => configArea.id === area._id);

                    if (configArea && configArea.multiplier !== 1)
                    {
                        // Calculate the new construction time
                        constructionTime = Math.round(stage.constructionTime * configArea.multiplier / 100);
                        changes.push(`Changed the construction time of the ${configArea.name} ${parseInt(stageKey) + 1} to: ${configArea.multiplier}% of the original time.`);
                    }
                    else
                    {
                        // Calculate the new construction time
                        constructionTime = Math.round(stage.constructionTime * configuration.globalHideoutConstructionMultiplier / 100);
                    }

                    stage.constructionTime = constructionTime;
                }
            })
        })

        // Log the changes
        logger.logWithColor(
            `[VariableConstructionTime] Changed the construction time of the hideout stages to: ${configuration.globalHideoutConstructionMultiplier}% of the original time.`,
            LogTextColor.GREEN
        );

    }
}

export const mod = new Mod();
