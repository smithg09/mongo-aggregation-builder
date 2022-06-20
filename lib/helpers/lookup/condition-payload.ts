import { PipelineError } from './../../errors/pipeline/pipeline.error';
import { AggregationBuilder } from './../../main';
import {
    LookupConditionInterface, StageInterface, LookupVariableListInterface
} from "../../interfaces";

/**
 * Join Conditions and Uncorrelated Sub-queries
 * To perform uncorrelated subQueries between two collections as well as allow other join conditions besides a single
 * equality match
 * @param from the collection in the same database to perform the join with. The from collection cannot be sharded.
 * @param as Specifies the name of the new array field to add to the input documents. The new array field contains the
 * matching documents from the from collection.
 * @param optional All optional parameters of the method - variableList, project, nestedAggregation and pipeline.
 *
 * @example
 * // with optional parameters
 * ConditionPayload('customers', 'customer', { variableList: ['customerId'], project: { firstname: 1 },
 * pipeline: [{ $match: { $expr: { $eq: ['$id', '$$customerId'] } } }] }
 * OPTIONAL project
 * OPTIONAL pipeline or nestedAggregation
 * OPTIONAL variableList
 */
export const ConditionPayload = (
    from: string, as: string,
    optional?: {
        project?: {[index: string]: any},
        pipeline?: StageInterface[],
        nestedAggregation?: AggregationBuilder,
        variableList?: Array<string | LookupVariableListInterface>,
    }
) => {
    const letObject: {[index: string]: any} = {};
    let pipeline: StageInterface[] = [];
    let keyMatchField: LookupVariableListInterface = {} as LookupVariableListInterface;

    if (optional && optional.pipeline) {
        pipeline = optional.pipeline;
    }

    if (optional && optional.nestedAggregation) {
        pipeline = optional.nestedAggregation.getPipeline();
    }

    if (optional && optional.variableList && optional.variableList[0]) {
        if (optional?.variableList?.filter(el => (typeof el === 'object' && (el?.key === 'primary'))).length > 1) {
            throw new PipelineError('Invalid Lookup Variable List Payload, Not more than 1 variable can be of key primary!');
        }
        optional.variableList.forEach(s => {
            if (typeof s === 'object') {
                const defaultValueForLetVar = s?.isList ? [] : null;
                letObject[s.var] = {
                    $ifNull: ['$' + s.source, defaultValueForLetVar]
                };
                if (s?.key === 'primary') {
                    keyMatchField = s;
                }
            } else {
                letObject[s] = '$' + s;
            }
        });
    }
    
    if (keyMatchField?.var) {
        pipeline.unshift({
            $match: {
                $expr: {
                    [keyMatchField?.isList ? '$in' : '$eq']: [`$${keyMatchField.overideEqualsVar || 'id'}`, `$$${keyMatchField?.var}`]
                }
            }
        })
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
