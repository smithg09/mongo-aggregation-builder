import {collStatsPayloadValidator} from "./collStats-payload.validator";
import {CollStatsStageInterface} from "../../interfaces";

describe('collStats validators', () => {
    describe('collStatsPayloadValidator', () => {
        const payloadList = [
            {},
            { latencyStats: {}, storageStats: { scale: 10 }, count: 0, queryExecStats: '' },
            { latencyStats: { histograms: true }, storageStats: {}, count: 0, queryExecStats: '' },
            { latencyStats: { histograms: true }, storageStats: { scale: 0 }, count: 0, queryExecStats: '' },
        ];

        test.each([
            [collStatsPayloadValidator(payloadList[0] as unknown as CollStatsStageInterface),
            'The following mandatory fields are missing: latencyStats, storageStats, count, queryExecStats.'],
            [collStatsPayloadValidator(payloadList[1] as unknown as CollStatsStageInterface),
                'The histograms latencyStats property is missing.'],
            [collStatsPayloadValidator(payloadList[2] as unknown as CollStatsStageInterface),
                'The scale storageStats property is missing.'],
            [collStatsPayloadValidator(payloadList[3] as unknown as CollStatsStageInterface),
                ''],
        ])('%o should return %o', (
            operation: any,
            expected: any
        ) => {
            expect(operation).toEqual(expected);
        });
    });
});
