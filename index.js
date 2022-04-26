const AggregationBuilder = require("./dist").AggregationBuilder;
const { EqualityPayload, OnlyPayload, Field, ConditionPayload } = require('./dist/helpers');
const { ArrayElemAt, Equal, Expression } = require('./dist/operators');

const userPipeline = new AggregationBuilder('THIS_SHOULD_BE_1')
    .Match(Expression(Equal('$id', '$$id')))
    .Project(OnlyPayload('id', 'name'))

const userSkills = new AggregationBuilder('THIS_SHOULD_BE_2')
    .Lookup(
        ConditionPayload(
            'profiles',
            'profile',
            {
                nestedPipeline: userPipeline,
                variableList: ['id']
            }
        )
    )
    .Project({ user: ArrayElemAt('$user', 0), ...OnlyPayload('name') })

console.log(JSON.stringify(userSkills.getPipeline(), null, 2))