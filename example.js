const AggregationBuilder = require("./dist").AggregationBuilder;
const { EqualityPayload, OnlyPayload, Field, ConditionPayload } = require('./dist/helpers');
const { ArrayElemAt, Equal, Expression, And, Let } = require('./dist/operators');

const TopicsAggregation = new AggregationBuilder('Topics')
    .Match(Expression(Equal('$status', 'published')))
    .Project({ ...OnlyPayload('id', 'title', 'order', 'isTrial', 'description', 'topicQuestions', 'thumbnail', 'thumbnailSmall', 'chapter', 'topicComponentRule'), topicAssignmentQuestions: { assignmentQuestions: { id: 1, }, }, })
    .Lookup(EqualityPayload('File', 'thumbnail', 'thumbnail.typeId', 'id'))
    .Lookup(EqualityPayload('File', 'thumbnailSmall', 'thumbnailSmall.typeId', 'id'))

const userCurrentTopicComponentStatuses = new AggregationBuilder('UserCurrentTopic')
    .Project(OnlyPayload('id', 'currentTopicComponentType', 'enrollmentType', 'currentLearningObjective', 'currentCourse', 'currentTopic', 'user'))
    .Match({ 'user.typeId': 'userId', 'currentCourse.typeId': 'courseId' })
    .Lookup(
        ConditionPayload('Course', 'currentCourse',
            {
                variableList: [
                    { var: 'courseId', source: 'currentCourse.typeId', key: 'primary' }
                ],
                nestedAggregation: new AggregationBuilder('Course')
                    .Project(OnlyPayload('id', 'title', 'description', 'bannerTitle', 'bannerDescription', 'badgeDescription', 'defaultLoComponentRule', 'chapters'))
                    .Lookup(
                        ConditionPayload('Chapter', 'chapters',
                            {
                                variableList: [
                                    { var: 'chapterId', source: 'chapters.typeId', key: 'primary' }
                                ],
                                nestedAggregation: new AggregationBuilder('Chapter')
                                    .Match(Expression(Equal('$status', 'published')))
                                    .Project(OnlyPayload('id', 'title', 'order', 'topics'))
                                    .Lookup(
                                        ConditionPayload('Topic', 'topics',
                                            {
                                                variableList: [
                                                    { var: 'topicsId', source: 'topics.typeId', key: 'primary' }
                                                ],
                                                nestedAggregation: TopicsAggregation
                                            })
                                    )
                            })
                    )
            }))
    .Lookup(
        ConditionPayload('Topic', 'currentTopic',
            {
                project: OnlyPayload('id', 'order'),
                variableList: [
                    { var: 'currentTopicId', source: 'currentTopic.typeId', key: "primary" },
                ],
            }))
    .Project({
        ...OnlyPayload('id', 'currentTopicComponentType', 'enrollmentType', 'currentLearningObjective'),
        currentCourse: ArrayElemAt('$currentCourse', 0),
        currentTopic: ArrayElemAt('$currentTopic', 0)
    })
    .getPipeline()

console.log(JSON.stringify(userCurrentTopicComponentStatuses, null, 2))