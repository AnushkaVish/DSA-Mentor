const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    firstName:{
        type: String,
        required: true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20,
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim: true,
        lowercase:true,
        immutable: true,
    },
    age:{
        type:Number,
        min:6,
        max:80,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default: 'user'
    },
    problemSolved: [{
  type: Schema.Types.ObjectId,
  ref: 'problem'
}],
    password:{
        type:String,
        required: true
    }
},{
    timestamps:true
});

userSchema.post('findOneAndDelete', async function (userInfo) {
    if (userInfo) {
      await mongoose.model('submission').deleteMany({ userId: userInfo._id });
    }
});


const User = mongoose.model("user",userSchema);

module.exports = User;







// {
//   "title": "Two Sum",
//   "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
//   "difficulty": "easy",
//   "tags": "array",
//   "visibleTestCases": [
//     {
//       "input": "[2,7,11,15], target = 9",
//       "output": "[0,1]",
//       "explanation": "nums[0] + nums[1] = 2 + 7 = 9"
//     },
//     {
//       "input": "[3,2,4], target = 6",
//       "output": "[1,2]",
//       "explanation": "nums[1] + nums[2] = 2 + 4 = 6"
//     }
//   ],
//   "hiddenTestCases": [
//     {
//       "input": "[1,2,3], target = 4",
//       "output": "[0,2]"
//     },
//     {
//       "input": "[5,5,5], target = 10",
//       "output": "[0,1]"
//     }
//   ],
//   "startCode": [
//     {
//       "language": "javascript",
//       "initialCode": "function twoSum(nums, target) {\n  // Your code here\n}"
//     },
//     {
//       "language": "python",
//       "initialCode": "def two_sum(nums, target):\n    # Your code here\n    pass"
//     }
//   ],
//   "referenceSolution": [
//     {
//       "language": "javascript",
//       "completeCode": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n}"
//     },
//     {
//       "language": "python",
//       "completeCode": "def two_sum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        if target - num in lookup:\n            return [lookup[target - num], i]\n        lookup[num] = i"
//     }
//   ],
//   "problemCreator": "64d9f2c3b2a1e5c8f9a12345"
// }