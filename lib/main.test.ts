import { AggregationBuilder } from "./";
import { PipelineError } from "./errors";

describe('should create a new pipeline builder object', () => {
    let
        AggregationBuilderWithDebug: AggregationBuilder,
        AggregationBuilderWithoutDebug: AggregationBuilder;

    describe('pipeline Builder With Debug', () => {
        beforeEach(() => {
            AggregationBuilderWithDebug = new AggregationBuilder('debug', { debug: true, logs: true});
        });

        it('should be defined', () => {
            expect(AggregationBuilderWithDebug).toBeDefined();
        });

        describe('getName()', () => {
            it('should return the pipeline builder name passed in the constructor', () => {
                expect(AggregationBuilderWithDebug.getName()).toContain('debug_');
            });
        });

        describe('enableDebug()', () => {
            it('should enable the builder debug', () => {
                expect(AggregationBuilderWithDebug.enableDebug()).toEqual(AggregationBuilderWithDebug);
            });
        });

        describe('disableDebug()', () => {
            it('should disable the builder debug', () => {
                expect(AggregationBuilderWithDebug.disableDebug()).toEqual(AggregationBuilderWithDebug);
            });
        });

        describe('reset()', () => {
            it('should return pipeline reset', () => {
                expect(AggregationBuilderWithDebug.resetPipeline()).toEqual([]);
            });
        });

        describe('getDebugActionList()', () => {
            it('should return the action stored in the debug history list at builder initialization', () => {
                const debugActionList = AggregationBuilderWithDebug.getDebugActionList();
                expect(debugActionList).toHaveLength(1);
                expect(debugActionList[0].action).toEqual(AggregationBuilderWithDebug.getName() + ' => constructor');
            });
        });

        describe('Paging()', () => {

            it('should return a new pipeline with a $facet step that contains 2 pipelines, one for paginated documents with 10 elements per page and another for the total count', () => {
                expect(
                    AggregationBuilderWithDebug
                        .addStage('match', {tests: 'unit'})
                        .Paging(10).getPipeline()
                ).toEqual([
                    { $facet: {
                            count: [
                                { $match: { tests: "unit" }},
                                { $count: "totalElements" }
                            ],
                            docs: [
                                { $match: {tests: "unit" } },
                                { $skip: 0 },
                                { $limit: 10 }
                            ]
                        } }
                ]);
            });

            it('should return a new pipeline with a $facet step that contains 2 pipelines, one for paginated documents with 20 elements per page, the page 5 requested and another for the total count', () => {
                expect(
                    AggregationBuilderWithDebug
                        .addStage('match', {tests: 'unit'})
                        .Paging(20, 5).getPipeline()
                ).toEqual([
                    { $facet: {
                            count: [
                                { $match: { tests: "unit" }},
                                { $count: "totalElements" }
                            ],
                            docs: [
                                { $match: {tests: "unit" } },
                                { $skip: 80 },
                                { $limit: 20 }
                            ]
                        } }
                ]);
            });

            it('should throw a new PipelineError if the elements per page is not valid', () => {
                expect(
                    () => AggregationBuilderWithDebug
                        .addStage('match', {tests: 'unit'})
                        .Paging(0)
                ).toThrowError(new PipelineError('You must specify at least 1 element per page.'));
            });

            it('should throw a new PipelineError if the requested page does not exist', () => {
                expect(
                    () => AggregationBuilderWithDebug
                        .addStage('match', {tests: 'unit'})
                        .Paging(10, 0)
                ).toThrowError(new PipelineError('The page you are looking for does not exist.'));
            });

            it('should throw a new PipelineError if a Paging stage has already been added', () => {
                expect(
                    () => AggregationBuilderWithDebug
                        .Paging(10, 1)
                        .Paging(3, 2)
                ).toThrowError(new PipelineError('A Paging stage has already been added.'));
            });

            it('should throw a new PipelineError if a Skip stage has already been added', () => {
                expect(
                    () => AggregationBuilderWithDebug
                        .Skip(10)
                        .Paging(3)
                ).toThrowError(new PipelineError('A Paging stage cannot be added if a Skip, Limit, or Count stage is already in the pipeline.'));
            });

            it('should throw a new PipelineError if a Limit stage has already been added', () => {
                expect(
                    () => AggregationBuilderWithDebug
                        .Limit(10)
                        .Paging(1)
                ).toThrowError(new PipelineError('A Paging stage cannot be added if a Skip, Limit, or Count stage is already in the pipeline.'));
            });

            it('should throw a new PipelineError if a Count stage has already been added', () => {
                expect(
                    () => AggregationBuilderWithDebug
                        .Count("total")
                        .Paging(3, 8)
                ).toThrowError(new PipelineError('A Paging stage cannot be added if a Skip, Limit, or Count stage is already in the pipeline.'));
            });

        });

        describe('Stage Methods => addStage()', () => {

            it('should not add the stage to the pipeline if its value is invalid', () => {
                expect(() => AggregationBuilderWithDebug.addStage('match', undefined))
                    .toThrowError(new PipelineError('The match stage value is not valid.'));
            });

            it('should not add the stage to the pipeline if its payload is invalid', () => {
                expect(() => AggregationBuilderWithDebug.Lookup({ from: 'tests', as: 'unit', localField: 'expect' }))
                    .toThrowError(new PipelineError('The foreignField property is required when localfield is specified.'));
            });

            test.each([
                ['should add a stage to the pipeline', 'addFields',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .AddFields({ tests: 'unit' }),
                    { tests: 'unit' }],
                ['should add a stage to the pipeline', 'addFields',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .AddFields({ tests: 'unit' }, { test: 'unit' }),
                    { tests: 'unit', test: 'unit' }],

                ['should add a stage to the pipeline', 'bucket',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Bucket({groupBy: '$name', boundaries: ['a', 'l', 'z']}),
                    {groupBy: '$name', boundaries: ['a', 'l', 'z']}],
                ['should add a stage to the pipeline', 'bucketAuto',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .BucketAuto({ groupBy: '$age', buckets: 5 }), { groupBy: '$age', buckets: 5 }],
                ['should add a stage to the pipeline', 'collStats',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .CollStats(
                        { latencyStats: { histograms: false }, storageStats: { scale: 2 }, count: {}, queryExecStats: {} }
                    ), { latencyStats: { histograms: false }, storageStats: { scale: 2 }, count: {}, queryExecStats: {} }],
                ['should add a stage to the pipeline', 'count',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Count('testCount'), 'testCount'],
                ['should add a stage to the pipeline', 'facet',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Facet({ output1: [] }, { output2: [] }), { output1: [], output2: [] }],
              ['should add a stage to the pipeline', 'facet',
               new AggregationBuilder('debug', { debug: true, logs: true})
                 .Facet({ output1: [], output2: [] }), { output1: [], output2: [] }],
                ['should add a stage to the pipeline', 'geoNear',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .GeoNear({ near: [20, 5], distanceField: 'distance' }),
                    { near: [20, 5], distanceField: 'distance' }],
                ['should add a stage to the pipeline', 'graphLookup',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .GraphLookup(
                        { from: 'tests', startWith: [15,30,45], connectFromField:'testId', connectToField: 'id',
                            as: 'pts' }
                    ), { from: 'tests', startWith: [15,30,45], connectFromField:'testId', connectToField: 'id',
                    as: 'pts' }],
                ['should add a stage to the pipeline', 'group',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Group({ _id: 'unit', tests: { $push: 'num'} }),
                    { _id: 'unit', tests: { $push: 'num'} }],
                ['should add a stage to the pipeline', 'indexStats',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .IndexStats({ tests: 'unit' }), { tests: 'unit' }],
                ['should add a stage to the pipeline', 'limit',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Limit(200), 200],
                ['should add a stage to the pipeline', 'listSessions',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .ListSessions({ tests: 'unit' }), { tests: 'unit' }],
                ['should add a stage to the pipeline', 'lookup',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Lookup({ from: 'unit', as: 'test' }), { from: 'unit', as: 'test' }],
                ['should add a stage to the pipeline', 'match',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Match({ tests: 'unit' }), { tests: 'unit' }],
                ['should add a stage to the pipeline', 'merge',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Merge({ into: 'unit' }), { into: 'unit' }],
                ['should add a stage to the pipeline', 'out',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Out({ db: 'tests', coll: 'unit' }), { db: 'tests', coll: 'unit' }],
                ['should add a stage to the pipeline', 'planCacheStats',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .PlanCacheStats({ tests: 'unit' }), { tests: 'unit' }],
                ['should add a stage to the pipeline', 'project',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Project({ tests: 1 }), { tests: 1 }],
                ['should add a stage to the pipeline', 'redact',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Redact({ tests: 'unit' }), { tests: 'unit' }],
                ['should add a stage to the pipeline', 'replaceRoot',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .ReplaceRoot({ newRoot: { tests: 'unit' } }), { newRoot: { tests: 'unit' } }],
                ['should add a stage to the pipeline', 'replaceWith',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .ReplaceWith({ tests: 'unit' }), { tests: 'unit' }],
                ['should add a stage to the pipeline', 'sample',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Sample({ size: 3 }), { size: 3 }],
                ['should add a stage to the pipeline', 'search',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Search({ tests: 'unit' }), { tests: 'unit' }],

                ['should add a stage to the pipeline', 'set',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Set({ tests: 'unit' }), { tests: 'unit' }],
                ['should add a stage to the pipeline', 'set',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Set({ tests: 'unit' }, { test: 'unit' }), { tests: 'unit', test: 'unit' }],

                ['should add a stage to the pipeline', 'skip',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Skip(100), 100],

                ['should add a stage to the pipeline', 'sort',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Sort({ tests: 'unit' }), { tests: 'unit' }],
                ['should add a stage to the pipeline', 'sort',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Sort({ tests: 'unit' }, { test: 'unit' }), { tests: 'unit', test: 'unit' }],

                ['should add a stage to the pipeline', 'sortByCount',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .SortByCount({ tests: 'unit' }), { tests: 'unit' }],
                ['should add a stage to the pipeline', 'unionWith',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .UnionWith({ coll: 'unit' }), { coll: 'unit' }],

                ['should add a stage to the pipeline', 'unset',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Unset('toto'), 'toto'],
                ['should add a stage to the pipeline', 'unset',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Unset('toto', 'test', 'unit'), ['toto', 'test', 'unit']],

                ['should add a stage to the pipeline', 'unwind',
                    new AggregationBuilder('debug', { debug: true, logs: true})
                        .Unwind('$tests' ), '$tests'],

            ])('%s: $%s => %o', (
                nameTest: string,
                stageType: string,
                stageOperation: any,
                expectedValue: any
            ) => {
                // addFields => $addFields
                const expected = {
                    ['$' + stageType]: expectedValue
                };

                expect(stageOperation.getPipeline()[0]).toEqual(expected);
            });
        });
    });

    describe('pipeline Builder Without Debug', () => {
        beforeEach(() => {
            AggregationBuilderWithoutDebug = new AggregationBuilder('no-debug');
        });

        it('should throw a PipelineError if the pipeline is empty', () => {
            expect(
                () => AggregationBuilderWithoutDebug.getPipeline()
            ).toThrow(new PipelineError(`Error, ${AggregationBuilderWithoutDebug.getName()} pipeline is empty!`));
        });

        it('should throw a PipelineError if the stage value is invalid', () => {
            expect(
                () => AggregationBuilderWithoutDebug.Match(undefined).getPipeline()
            ).toThrowError(new PipelineError('1) The match stage value is not valid.'));
        });

        it('should throw a PipelineError if the stage payload is invalid', () => {
            expect(
                () => AggregationBuilderWithoutDebug.Lookup({ from: 'test', as: 'unit', localField: 'toto' }).getPipeline()
            ).toThrowError(new PipelineError('1) The foreignField property is required when localfield is specified.'));
        });

        it('should throw a PipelineError if the stage value or one of its element is not valid when calling toObject method', () => {
            expect(() => AggregationBuilderWithoutDebug.AddFields(
                    ["{ tests: 'unit' }"]
            )).toThrowError(new PipelineError('The AddFields stage value is not valid.'));
        });

        it('should throw a PipelineError if the stage value or one of its element is not valid when calling toObject method', () => {
            expect(() => AggregationBuilderWithoutDebug.AddFields(
                [{ tests: 'unit' }], { test: 'unit'}, {}, [{}]
            )).toThrowError(new PipelineError('3 fields of the AddFields stage are not valid.'));
        });
    });
});
