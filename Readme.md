<div style="text-align: center; width: 100%;">

<!-- [-> Technical documentation <-](https://mikedev75015.github.io/mongodb-pipeline-builder) -->

# mongodb-aggregation-builder

</div>


<p style="text-align: justify; width: 100%;font-size: 15px;">

### **Note: This project is forked and a continuation of [mongo-pipeline-builder](https://github.com/MikeDev75015/mongodb-pipeline-builder). highly recommeded to check that out. Few Addons are being built upon the existing codebase**

<br />

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

___
