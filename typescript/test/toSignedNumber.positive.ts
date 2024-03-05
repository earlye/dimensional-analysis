import * as d from  "../src/index.js"

type s3 = [3,1]
type S3 = d.ToSignedNumber<[1,2,3],1>;
d.exactType({} as s3, {} as S3);
