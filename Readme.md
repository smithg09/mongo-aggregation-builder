<div style="text-align: center; width: 100%;">

<!-- [-> Technical documentation <-](https://mikedev75015.github.io/mongodb-pipeline-builder) -->

# mongodb-aggregation-builder

</div>


<p style="text-align: justify; width: 100%;font-size: 15px;">

**mongodb-aggregation-builder** is a aggregation builder for the [db.collection.aggregate](https://docs.mongodb.com/manual/reference/method/db.collection.aggregate/) method and db.aggregate method.

- Simplify aggregations by making them more readable
- Aggregations are easier to edit. 
- Aggregations are testable on a dataset. 
- Aggregation stages appear in an array. 
- Sequential stages for documents

</p>

## npm package <img src="https://pbs.twimg.com/media/EDoWJbUXYAArclg.png" width="24" height="24" />

### `npm i -S mongodb-aggregation-builder`

## Usage:


### Using `require()`

```typescript
const AggregationBuilder = require("mongodb-aggregation-builder").AggregationBuilder;
const { EqualityPayload, OnlyPayload, Field } = require('mongodb-aggregation-builder/helpers');
const { LessThanEqual, ArrayElemAt, Equal, Expression } = require('mongodb-aggregation-builder/operators');
```

### Using `import`


```typescript
import { AggregationBuilder } from 'mongodb-aggregation-builder';
import { EqualityPayload, OnlyPayload, Field } from 'mongodb-aggregation-builder/helpers';
import { LessThanEqual, ArrayElemAt, Equal, Expression } from 'mongodb-pipeline-builder/operators';
```

## Pagination example


```typescript
const myNewPipeline = new AggregationBuilder( 'myPagination', { debug: true } )
    .Match( Expression( LessThanEqual( '$id', 20 ) ) )
    .Project( OnlyPayload( 'name', 'weight' ) )
    .Paging( 5, 3 ) // 5 per page, page 3
    .getPipeline();
```

*is equivalent to*


```typescript
const myNewPipeline = [ {
    $facet: {
        docs: [
            { $match: { $expr: { $lte: ["$id", 20] } } },
            { $project: { _id: 0, name: 1, weight: 1 } },
            { $skip: 10 },
            { $limit: 5 }
        ],
        count: [
            { $match: { $expr: { $lte: ["$id", 20] } } },
            { $project: { _id: 0, name: 1, weight: 1 } },
            { $count: "totalElements" }
        ]
    }
} ];
```

## No pagination example

```typescript
const myNewPipeline = new AggregationBuilder( 'user-skills' )
    .Match( Expression( Equal( '$id', 123456 ) ) )
    .Lookup( EqualityPayload( 'profiles', 'profile', 'profileId', 'id' ) )
    .Project( OnlyPayload( 'firstname', 'lastname', 'email' ) )
    .AddFields(
        Field( 'skills', ArrayElemAt( '$profile.skills', 0 ) ),
        Field( 'availability', ArrayElemAt( '$profile.availability', 0 ) )
    )
    .Unset( 'profile' )
    .getPipeline();
```

*is equivalent to*

```typescript
const myNewPipeline = [
    { $match: { $expr: { $eq: ["$id", 123456] } } },
    { $lookup: { from: "profiles", as: "profile", localField: "profileId", foreignField: "id" } },
    { $project: { _id: 0, firstname: 1, lastname: 1, email: 1 } },
    { $addFields: {
        skills: { $arrayElemAt: ["$profile.skills", 0] },
        availability: { $arrayElemAt: ["$profile.availability", 0] }
    } },
    { $unset: "profile" }
];
```

___

#  GetResult method

```typescript
GetResult(): Promise<GetResultResponse | GetPagingResultResponse>
```

<p style="font-size: 15px;">

`GetResult()` is an **asynchronous** method that provides a very easy way to use aggregation pipelines on a target (collection or mongoose model having the aggregation method) with either pagination or not.

<p>

## GetResultResponse

<p style="font-size: 15px;">

Without pagination, the `GetResult()` method returns a GetResultResponse object that contains two methods:<br>

- `GetDocs(): any[]` to get the documents found.
- `GetCount(): number` to get the total number of documents found.

</p>


```typescript
const result = await GetResult( target, pipeline ); 
result.GetDocs(); // () => any[]
result.GetCount(); // () => number
```

*Or*
```typescript
GetResult( target, pipeline ).then( result => {
    result.GetDocs(); // () => any[]
    result.GetCount(); // () => number
} );
```

### `GetDocs()` method possibilities:

<p style="font-size: 15px;">
A particular document can be retrieved by specifying its index as an argument of the `GetDocs()` method.

To get the last document, the argument to provide is the string `'last'`. 

If the specified index is greater than the index of the last document, `GetDocs()` will return the last document.
</p>

```typescript
// GetDocs() -> [document0, document1, document2, document3, ..., document51]
result.GetDocs(2); // will return document to index 2, document2
result.GetDocs('last'); // will return the last document, document51
result.GetDocs(99); // will return the last document, document51
```

## GetPagingResultResponse

<p style="font-size: 15px;">

With pagination,  `GetResult()` returns a `GetPagingResultResponse` object that contains three methods:
- `GetDocs()` to get the documents found.
- `GetCount()` to get the total number of documents found.
- `GetTotalPageNumber()` to get the total number of pages.

</p>


```typescript
const result = await GetResult(target, pipeline);
result.GetDocs(); // () => any[]
result.GetCount(); // () => number
result.GetTotalPageNumber(); // () => number
```

*Or*
```typescript
GetResult(target, pipeline).then( result => {
    result.GetDocs(); // () => any[]
    result.GetCount(); // () => number
    result.GetTotalPageNumber(); // () => number
} );
```


___


[-> Try the lib on NPM RunKit with the require method <-](https://npm.runkit.com/mongodb-aggregation-builder)

[-> Aggregation Pipeline Stages <-](https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/)


## MONGODB NATIVE STAGES:
- AddFields 
- Bucket 
- BucketAuto 
- CollStats 
- Count 
- Facet 
- GeoNear 
- GraphLookup 
- Group 
- IndexStats 
- Limit 
- ListSessions 
- Lookup 
- Match 
- Merge 
- Out 
- PlanCacheStats 
- Project 
- Redact 
- ReplaceRoot 
- ReplaceWith 
- Sample 
- Search 
- Set 
- Skip 
- Sort 
- SortByCount 
- UnionWith 
- Unset 
- Unwind

## CUSTOM STAGE:

- Paging

___

<div style="text-align: center; width: 100%;">

[-> Aggregation Pipeline Helpers <-](https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/)

</div> 

## STAGE HELPERS <span style="color: red">*</span> :

- Bucket ( GroupByPayload )
- BucketAuto ( GroupByAutoPayload )
- CurrentOp ( OpPayload )
- GeoNear ( NearPayload )
- Lookup ( ConditionPayload | EqualityPayload )
- Merge ( IntoPayload )
- Out ( DbCollPayload )
- Project ( IgnorePayload | OnlyPayload )
- Sample ( SizePayload )
- UnionWith ( CollectionPayload )

## COMMON HELPERS:

- Field: AddFields( Field ** ) | Facet( Field ** ) | Set( Field ** ) | Sort( Field ** )<br>
- List


<p style="font-style: italic">
<span style="color: red">*</span> If no helper is available for a stage, use stage method and pass it a valid value as a parameter.<br>
** One or more Field helper(s) separated by a comma.
</p>
___
<div style="text-align: center; width: 100%;">

[-> Aggregation Pipeline Operators <-](https://docs.mongodb.com/manual/reference/operator/aggregation/)

</div>
<p style="font-size: 15px;">
Absolute | Accumulator | Acos | Acosh | Add | AddToSet | AllElementsTrue | And | AnyElementTrue | ArrayElemAt | ArrayToObject | Asin | Asinh | Atan | Atan2 | Atanh | Avg | BinarySize | BsonSize | Ceil | Compare | Concat | ConcatArrays | Cond | Convert | Cos | Cosh | DateFromParts | DateFromString | DateToParts | DateToString | DayOfMonth | DayOfWeek | DayOfYear | DegreesToRadians | Divide | Equal | Exponent | Expression | Filter | First | Floor | FunctionOperator | GreaterThan | GreaterThanEqual | Hour | IfNull | In | IndexOfArray | IndexOfBytes | IndexOfCP | IsArray | IsNumber | IsoDayOfWeek | IsoWeek | IsoWeekYear | Last | LessThan | LessThanEqual | Let | Literal | Log | Log10 | Ltrim | MapOperator | Max | MergeObjects | Meta | Millisecond | Min | Minute | Mod | Month | Multiply | NaturalLog | Not | NotEqual | ObjectToArray | Or | Pow | Push | RadiansToDegrees | Rand | Range | Reduce | RegexFind | RegexFindAll | RegexMatch | ReplaceAll | ReplaceOne | ReverseArray | Round | Rtrim | SampleRate | Second | SetDifference | SetEquals | SetIntersection | SetIsSubset | SetUnion | Sin | Sinh | Size | Slice | Split | Sqrt | StdDevPop | StdDevSamp | StrCaseCmp | StrLenBytes | StrLenCP | Substr | SubstrBytes | SubstrCP | Subtract | Sum | Switch | Tan | Tanh | ToBool | ToDate | ToDecimal | ToDouble | ToInt | ToLong | ToLower | ToObjectId | ToString | ToUpper | Trim | Trunc | Type | Week | Year | Zip
</p>
