const { client } = require("../config/database");

const db = client.db("fatwa");
const allDataCollection = db.collection("alldata");
async function createQuestion(req, res) {
  try {
    const supply = req.body;
    supply.createdAt = new Date();
    const result = await allDataCollection.insertOne(supply);
    res.send(result);
  } catch (error) {
    res.status(500).send({ status: false, message: "Internal Server Error" });
  }
}

async function getAllQuestions(req, res) {
  try {
    const query = {};
    if (req.query.approve) {
      query.approve = req.query.approve === "true";
    }
    if (req.query.pending) {
      query.pending = req.query.pending === "true";
    }
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    if (req.query.useremail) {
      query.useremail = req.query.useremail;
    }
    const cursor = allDataCollection.find(query);
    const supply = await cursor.toArray();
    res.send({ status: true, data: supply });
  } catch (error) {
    res.status(500).send({ status: false, message: "Internal Server Error" });
  }
}
async function getRecentPosts(req, res) {
  try {
    const query = {};
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    const cursor = allDataCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(5);
    const supply = await cursor.toArray();
    res.send({ status: true, data: supply });
  } catch (error) {
    res.status(500).send({ status: false, message: "Internal Server Error" });
  }
}

async function getSingleQuestion(req, res) {
  const qn = parseInt(req.params.qn);
  try {
    const result = await allDataCollection.findOne({ qn });
    if (!result) {
      return res.status(404).send({ message: "Data not found" });
    }
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

async function updateQuestion(req, res) {
  const qn = parseInt(req.params.qn);
  const supply = req.body;
  const filter = { qn };
  const updateDoc = {
    $set: {
      headline: supply.headline,
      question: supply.question,
      ans: supply.ans,
      proof: supply.proof,
      approve: supply.approve,
      pending: supply.pending,
    },
  };
  try {
    const options = { upsert: true };
    const result = await allDataCollection.updateOne(
      filter,
      updateDoc,
      options
    );
    res.json(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

async function deleteQuestion(req, res) {
  const qn = parseInt(req.params.qn);
  try {
    const result = await allDataCollection.deleteOne({ qn });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}
// ------------------------------------
async function searchQuestions(req, res) {
  const { query } = req.query;
  try {
    const results = await allDataCollection
      .find({
        headline: { $regex: query, $options: "i" },
        question: { $regex: query, $options: "i" },
        ans: { $regex: query, $options: "i" },
      })
      .toArray();
    res.send({ status: true, data: results });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
}

async function getTrending(req, res) {
  try {
    const results = await allDataCollection
      .find({})
      .sort({ views: -1 })
      .limit(50)
      .toArray();
    res.send({ status: true, data: results });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}
async function getSingleTrending(req, res) {
  const qn = parseInt(req.params.qn);
  try {
    const result = await allDataCollection.findOne({ qn });
    if (!result) {
      return res.status(404).send({ message: "Post not found" });
    }
    res.send({ status: true, data: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

//  Like Question answer
async function likeQuestion(req, res) {
  const qn = parseInt(req.params.qn);
  // Check if the user is authenticated (Assume a JWT token is used)
  // const token = req.headers.authorization?.split(" ")[1];
  // if (!token) {
  //   return res
  //     .status(401)
  //     .send({ status: false, message: "Authentication required" });
  // }

  try {
    // Increment the likes for the question
    const result = await allDataCollection.updateOne(
      { qn },
      { $inc: { likes: 1 } }
    );
    res.send({ status: true, message: "Liked successfully", result });
  } catch (error) {
    res.status(500).send({ status: false, message: "Internal Server Error" });
  }
}
//  Comments Create
async function commentQuestion(req, res) {
  const qn = parseInt(req.params.qn);
  const { comment } = req.body;

  // Check if the user is authenticated
  // const token = req.headers.authorization?.split(" ")[1];
  // if (!token) {
  //   return res
  //     .status(401)
  //     .send({ status: false, message: "Authentication required" });
  // }

  try {
    // Add the new comment to the question
    const result = await allDataCollection.updateOne(
      { qn },
      { $push: { comments: comment } }
    );
    res.send({ status: true, message: "Comment added", result });
  } catch (error) {
    res.status(500).send({ status: false, message: "Internal Server Error" });
  }
}
// Question Share
async function shareQuestion(req, res) {
  const qn = parseInt(req.params.qn);

  // Check if the user is authenticated
  // const token = req.headers.authorization?.split(" ")[1];
  // if (!token) {
  //   return res
  //     .status(401)
  //     .send({ status: false, message: "Authentication required" });
  // }

  try {
    // Logic to handle share (e.g., increment the share count or track shares)
    const result = await allDataCollection.updateOne(
      { qn },
      { $inc: { shares: 1 } }
    );
    res.send({ status: true, message: "Post shared", result });
  } catch (error) {
    res.status(500).send({ status: false, message: "Internal Server Error" });
  }
}

module.exports = {
  createQuestion,
  getAllQuestions,
  getRecentPosts,
  getSingleQuestion,
  updateQuestion,
  deleteQuestion,
  searchQuestions,
  getTrending,
  getSingleTrending,
  likeQuestion,
  commentQuestion,
  shareQuestion,
};
