import "../src/index.js"

type s3 = [3,1]
type S3 = ToSignedNumber<[1,2,3],1>;
exactType({} as s3, {} as S3);
