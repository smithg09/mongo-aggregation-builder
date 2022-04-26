import { AggregationBuilder } from './../../main';
import {
    LookupConditionInterface, StageInterface
} from "../../interfaces";

/**
 * Join Conditions and Uncorrelated Sub-queries
 * To perform uncorrelated subQueries between two collections as well as allow other join conditions besides a single
 * equality match
 * @param from the collection in the same database to perform the join with. The from collection cannot be sharded.
 * @param as Specifies the name of the new array field to add to the input documents. The new array field contains the
 * matching documents from the from collection.
 * @param optional All optional parameters of the method - variableList, project, nestedPipeline and pipeline.
 *
 * @example
 * // with optional parameters
 * ConditionPayload('customers', 'customer', { variableList: ['customerId'], project: { firstname: 1 },
 * pipeline: [{ $match: { $expr: { $eq: ['$id', '$$customerId'] } } }] }
 * OPTIONAL project
 * OPTIONAL pipeline or nestedPipeline
 * OPTIONAL variableList
 */
export const ConditionPayload = (
    from: string, as: string,
    optional?: {
        project?: {[index: string]: any},
        pipeline?: StageInterface[],
        nestedPipeline?: AggregationBuilder,
        variableList?: string[]
    }
) => {
    const letObject: {[index: string]: any} = {};
    let pipeline: StageInterface[] = [];

    if (optional && optional.pipeline) {
        pipeline = optional.pipeline;
    }

    if (optional && optional.nestedPipeline) {
        pipeline = optional.nestedPipeline.getPipeline();
    }

    if (optional && optional.variableList && optional.variableList[0]) {
        optional.variableList.forEach(s => letObject[s] = '$' + s);
    }

    if (optional && optional.project && Object.keys(optional.project).length) {
        pipeline = pipeline.concat([{ $project: optional.project }]);
    }

    const payload: LookupConditionInterface = {
        from: from,
        as: as,
    };

    if (Object.keys(letObject).length) {
        payload.let = letObject;
    }
    
    if (pipeline.length) {
        payload.pipeline = pipeline;
    }


    return payload;
};
