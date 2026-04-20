const Problem = require('../models/problem')
const Submission = require("../models/submission");
const User = require('../models/user')
const Contest = require("../models/contest");
const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");

const submitCode = async (req,res)=>{
   
    // 
    try{
      
       const userId = req.result._id;
       const problemId = req.params.id;

       let {code,language, contestId} = req.body;

      if(!userId||!code||!problemId||!language)
        return res.status(400).send("Some field missing");
      

      if(language==='cpp')
        language='c++'
      
      console.log(language);
      
    //    Fetch the problem from database
       const problem =  await Problem.findById(problemId);
    //    testcases(Hidden)
    
    //   Kya apne submission store kar du pehle....
    const submittedResult = await Submission.create({
          userId,
          problemId,
          code,
          language,
          status:'pending',
          testCasesTotal:problem.hiddenTestCases.length
     })

    //    Judge0 code ko submit karna hai
    
    const languageId = getLanguageById(language);
   
    const submissions = problem.hiddenTestCases.map((testcase)=>({
        source_code:code,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output
    }));

    
    const submitResult = await submitBatch(submissions);
    
    if(!submitResult || submitResult.length === 0){
        return res.status(500).send("No submission results received");
    }

    const resultToken = submitResult.map((value)=> value.token);

    const testResult = await submitToken(resultToken);
    

    // submittedResult ko update karo
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;


    for(const test of testResult){
        if(test.status_id==3){
           testCasesPassed++;
           runtime = runtime+parseFloat(test.time)
           memory = Math.max(memory,test.memory);
        }else{
          if(test.status_id==4){
            status = 'error'
            errorMessage = test.stderr
          }
          else{
            status = 'wrong'
            errorMessage = test.stderr
          }
        }
    }


    // Store the result in Database in Submission
    submittedResult.status   = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();
    
    // Update contest score if applicable
    if (contestId && status === 'accepted') {
        try {
            const contest = await Contest.findById(contestId);
            const now = new Date();
            
            if (contest && now >= contest.startTime && now <= contest.endTime) {
                let participant = contest.participants.find(p => p.user.toString() === userId.toString());
                
                // Automatically register if not already registered
                if (!participant) {
                    contest.participants.push({ user: userId, score: 0, solvedProblems: [], solvedMcqs: [] });
                    participant = contest.participants[contest.participants.length - 1];
                }
                
                if (participant) {
                    const alreadySolved = participant.solvedProblems.some(pid => pid.toString() === problemId.toString());
                    
                    if (!alreadySolved) {
                        const problemConfig = contest.problems.find(p => p.problemId.toString() === problemId.toString());
                        
                        if (problemConfig) {
                            participant.score += problemConfig.points;
                            participant.solvedProblems.push(problemId);
                            participant.submissionTime = now;
                            
                            // Explicitly mark as modified for Mongoose if needed
                            contest.markModified('participants');
                            await contest.save();
                        }
                    }
                }
            }
        } catch (contestErr) {
            console.error("Error updating contest score:", contestErr);
        }
    }
    
    // ProblemId ko insert karenge userSchema ke problemSolved mein if it is not persent there.
    
    // req.result == user Information

    if(!req.result.problemSolved.includes(problemId)){
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }
    
    const accepted = (status == 'accepted')
    res.status(201).json({
      accepted,
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory
    });
       
    }
    catch(err){
      res.status(500).send("Internal Server Error "+ err);
    }
}


const runCode = async(req,res)=>{
    
     // 
     try{
      const userId = req.result._id;
      const problemId = req.params.id;

      let {code,language} = req.body;

     if(!userId||!code||!problemId||!language)
       return res.status(400).send("Some field missing");

   //    Fetch the problem from database
      const problem =  await Problem.findById(problemId);
   //    testcases(Hidden)
      if(language==='cpp')
        language='c++'

   //    Judge0 code ko submit karna hai

   const languageId = getLanguageById(language);

   const submissions = problem.visibleTestCases.map((testcase)=>({
       source_code:code,
       language_id: languageId,
       stdin: testcase.input,
       expected_output: testcase.output
   }));


   const submitResult = await submitBatch(submissions);
    
    if(!submitResult || submitResult.length === 0){
        return res.status(500).send("No submission results received");
    }
    
    const resultToken = submitResult.map((value)=> value.token);

   const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;

    for(const test of testResult){
        if(test.status_id==3){
           testCasesPassed++;
           runtime = runtime+parseFloat(test.time)
           memory = Math.max(memory,test.memory);
        }else{
          if(test.status_id==4){
            status = false
            errorMessage = test.stderr
          }
          else{
            status = false
            errorMessage = test.stderr
          }
        }
    }

   
  
   res.status(201).json({
    success:status,
    testCases: testResult,
    runtime,
    memory
   });
      
   }
   catch(err){
     res.status(500).send("Internal Server Error "+ err);
   }
}


module.exports = {submitCode,runCode};
