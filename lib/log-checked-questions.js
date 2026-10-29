function logCheckedQuestions(req, res) {
    const checkedQuestionIds = req.body?.checkedQuestionIds;
    const validQuestionId = /^q(?:[1-9]|[1-9]\d|100)$/;

    if (
        !Array.isArray(checkedQuestionIds) ||
        checkedQuestionIds.length > 100 ||
        !checkedQuestionIds.every((id) => typeof id === 'string' && validQuestionId.test(id)) ||
        new Set(checkedQuestionIds).size !== checkedQuestionIds.length
    ) {
        return res.status(400).json({ error: 'Invalid checked question IDs.' });
    }

    console.info(
        `[CHECKED QUESTIONS] ${new Date().toISOString()} IDs: ${checkedQuestionIds.join(', ') || '(none)'}`
    );
    return res.sendStatus(204);
}

module.exports = logCheckedQuestions;
