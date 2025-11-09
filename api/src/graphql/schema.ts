import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # ============================================
  # LANGUAGE TYPE
  # ============================================
  type Language {
    _id: ID!
    code: String!
    name: String!
    native_name: String!
    direction: String!
    locale: String
    script: String
    ai_supported: Boolean!
    createdAt: String
    updatedAt: String
  }

  # ============================================
  # COUNTRY TYPE
  # ============================================
  type CountryResponceType {
    _id: ID!
    name: String!
    code: String!
    default_language_code: String!
    supported_language_codes: [String!]!
    flag_url: String
    content: String
    createdAt: String
    updatedAt: String
  }

  # ============================================
  # BOARD TYPE
  # ============================================
  type BoardResponceType {
    _id: ID!
    name: String!
    short_code: String!
    country_id: ID!
    default_language_id: ID!
    supported_language_ids: [ID!]!
    description: String
    logo_url: String
    content: String
    createdAt: String
    updatedAt: String
  }

  # ============================================
  # CLASS TYPE (Matches Education-AI exactly)
  # ============================================
  type ClassResponceType {
    _id: ID!
    board_id: ID!
    language_id: ID!
    supported_language_ids: [ID!]!
    name: String!
    grade: Int!
    content: String
    createdAt: String
    updatedAt: String
  }

  # ============================================
  # SUBJECT TYPE (Matches Education-AI exactly)
  # ============================================
  type SubjectResponceType {
    _id: ID!
    class_id: ID!
    language_id: ID!
    supported_language_ids: [ID!]!
    code: String!
    icon: String
    name: String!
    book_name: String
    downloadNotes: String
    downloadPDF: String
    downloadQA: String
    content: String
    tag: [String!]!
    source: String
    author: String
    createdAt: String
    updatedAt: String
  }

  # ============================================
  # CHAPTER TYPE (Matches Education-AI exactly)
  # ============================================
  type ChapterResponceType {
    _id: ID!
    board_id: ID!
    class_id: ID!
    subject_id: ID!
    language_id: ID!
    supported_language_ids: [ID!]!
    order: Int!
    is_published: Boolean!
    created_by: ID
    title: String!
    slug: String!
    seo_title: String
    seo_description: String
    downloadNotes: String
    downloadPDF: String
    downloadQA: String
    content: String
    version: Int!
    tag: [String!]!
    source: String
    author: String
    createdAt: String
    updatedAt: String
  }

  # ============================================
  # TOPIC TYPE (Matches Education-AI exactly)
  # ============================================
  type TopicResponceType {
    _id: ID!
    chapter_id: ID!
    language_id: ID!
    supported_language_ids: [ID!]!
    title: String!
    slug: String!
    order: Int!
    is_published: Boolean!
    created_by: ID
    content: String
    tag: [String!]!
    source: String
    author: String
    downloadNotes: String
    downloadPDF: String
    downloadQA: String
    createdAt: String
    updatedAt: String
  }

  # ============================================
  # SUBTOPIC TYPE (Matches Education-AI exactly)
  # ============================================
  type SubTopicResponceType {
    _id: ID!
    topic_id: ID!
    language_id: ID!
    supported_language_ids: [ID!]!
    title: String!
    slug: String!
    order: Int!
    is_published: Boolean!
    created_by: ID
    content: String
    tag: [String!]!
    source: String
    author: String
    downloadNotes: String
    downloadPDF: String
    downloadQA: String
    createdAt: String
    updatedAt: String
  }

  # ============================================
  # GB CATEGORY TYPE (General Blogging - Matches Education-AI)
  # ============================================
  type GBCategoryResponceType {
    _id: ID!
    name: String!
    slug: String!
    description: String
    content: String
    language_id: ID!
    supported_language_ids: [ID!]!
    order: Int!
    image: String
    tag: [String!]!
    source: String
    author: String
    is_published: Boolean!
    created_by: ID
    createdAt: String
    updatedAt: String
  }

  # ============================================
  # GB TOPIC TYPE (Matches Education-AI)
  # ============================================
  type GBTopicResponceType {
    _id: ID!
    gb_category_id: ID!
    name: String!
    slug: String!
    description: String
    content: String
    language_id: ID!
    supported_language_ids: [ID!]!
    order: Int!
    image: String
    tag: [String!]!
    source: String
    author: String
    is_published: Boolean!
    created_by: ID
    createdAt: String
    updatedAt: String
  }

  # ============================================
  # GB SUBTOPIC TYPE (Matches Education-AI)
  # ============================================
  type GBSubtopicResponceType {
    _id: ID!
    gb_topic_id: ID!
    name: String!
    slug: String!
    description: String
    content: String
    language_id: ID!
    supported_language_ids: [ID!]!
    order: Int!
    image: String
    tag: [String!]!
    source: String
    author: String
    is_published: Boolean!
    created_by: ID
    createdAt: String
    updatedAt: String
  }

  # ============================================
  # GB QUESTION TYPE (Matches Education-AI)
  # ============================================
  type GBQuestionResponceType {
    _id: ID!
    gb_subtopic_id: ID!
    question: String!
    slug: String!
    answer: String
    content: String
    language_id: ID!
    supported_language_ids: [ID!]!
    order: Int!
    image: String
    tag: [String!]!
    source: String
    author: String
    difficulty_level: String!
    is_published: Boolean!
    created_by: ID
    createdAt: String
    updatedAt: String
  }

  # ============================================
  # MCQ TYPE
  # ============================================
  type MCQOption {
    key: String!
    text: String!
  }

  type MCQResponceType {
    _id: ID!
    entity_type: String!
    entity_id: ID!
    question: String!
    options: [MCQOption!]!
    correct_answer: String!
    explanation: String
    difficulty: String!
    tags: [String!]!
    is_active: Boolean!
    created_by: ID
    content: String
    createdAt: String
    updatedAt: String
  }

  # ============================================
  # FAQ TYPE
  # ============================================
  type FAQResponceType {
    _id: ID!
    entity_type: String!
    entity_id: ID!
    question: String!
    answer: String!
    category: String
    order: Int!
    is_active: Boolean!
    created_by: ID
    content: String
    supported_language_ids: [ID!]!
    createdAt: String
    updatedAt: String
  }

  # ============================================
  # DESCRIPTIVE QUESTION TYPE
  # ============================================
  type DescriptiveQuestionResponceType {
    _id: ID!
    entity_type: String!
    entity_id: ID!
    question: String!
    answer: String!
    difficulty: String!
    tags: [String!]!
    is_active: Boolean!
    created_by: ID
    content: String
    createdAt: String
    updatedAt: String
  }

  # ============================================
  # PAGINATION TYPES
  # ============================================
  type MCQPagination {
    data: MCQPaginationData!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type MCQPaginationData {
    mcqs: [MCQResponceType!]!
  }

  type FAQPagination {
    data: FAQPaginationData!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type FAQPaginationData {
    faqs: [FAQResponceType!]!
  }

  type DescriptiveQuestionPagination {
    data: DescriptiveQuestionPaginationData!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type DescriptiveQuestionPaginationData {
    descriptiveQuestions: [DescriptiveQuestionResponceType!]!
  }

  # ============================================
  # QUERIES
  # ============================================
  type Query {
    # Language Queries
    languages: [Language!]!
    language(code: String!): Language

    # Country Queries
    countries: [CountryResponceType!]!
    getCountry(code: String!): CountryResponceType
    country(code: String!): CountryResponceType

    # Board Queries
    boards: [BoardResponceType!]!
    getBoard(short_code: String!): BoardResponceType
    board(short_code: String!): BoardResponceType
    boardsByCountry(country_code: String!): [BoardResponceType!]!

    # Class Queries
    classes: [ClassResponceType!]!
    class(id: ID!): ClassResponceType
    classesByBoard(board_short_code: String!): [ClassResponceType!]!
    getClassByBoardAndGrade(board_short_code: String!, grade: Int!): ClassResponceType

    # Subject Queries
    subjects: [SubjectResponceType!]!
    subject(id: ID!): SubjectResponceType
    subjectsByBoardAndClass(board_short_code: String!, grade: Int!): [SubjectResponceType!]!
    subjectByBoardAndClassAndSubject(board_short_code: String!, class_grade: Int!, subject_code: String!): SubjectResponceType

    # Chapter Queries
    chapters: [ChapterResponceType!]!
    chapter(slug: String!): ChapterResponceType
    getChapterBySlug(board_short_code: String!, class_grade: Int!, subject_code: String!, chapter_slug: String!): ChapterResponceType
    getChaptersByBoardClassAndSubject(board_short_code: String!, class_grade: Int!, subject_code: String!): [ChapterResponceType!]!

    # Topic Queries
    topics: [TopicResponceType!]!
    topic(slug: String!): TopicResponceType
    getTopicByBoardClassSubjectChapterAndTopic(board_short_code: String!, class_grade: Int!, subject_code: String!, chapter_slug: String!, topic_slug: String!): TopicResponceType
    getTopicsByBoardClassSubjectAndChapter(board_short_code: String!, class_grade: Int!, subject_code: String!, chapter_slug: String!): [TopicResponceType!]!

    # SubTopic Queries
    subTopics: [SubTopicResponceType!]!
    subTopic(slug: String!): SubTopicResponceType
    getSubTopicByBoardClassSubjectChapterTopicAndSubTopic(board_short_code: String!, class_grade: Int!, subject_code: String!, chapter_slug: String!, topic_slug: String!, subtopic_slug: String!): SubTopicResponceType
    getSubTopicsByBoardClassSubjectChapterAndTopic(board_short_code: String!, class_grade: Int!, subject_code: String!, chapter_slug: String!, topic_slug: String!): [SubTopicResponceType!]!

    # MCQ Queries
    mcqs(entity_type: String, entity_id: String, page: Int, limit: Int): [MCQResponceType!]!
    mcq(id: ID!): MCQResponceType
    mcqsWithPagination(entity_type: String, entity_id: String, page: Int, limit: Int): MCQPagination!

    # FAQ Queries
    faqs(entity_type: String, entity_id: String, page: Int, limit: Int): [FAQResponceType!]!
    faq(id: ID!): FAQResponceType
    faqsWithPagination(entity_type: String, entity_id: String, page: Int, limit: Int): FAQPagination!

    # Descriptive Question Queries
    descriptiveQuestions(entity_type: String, entity_id: String, page: Int, limit: Int): [DescriptiveQuestionResponceType!]!
    descriptiveQuestion(id: ID!): DescriptiveQuestionResponceType
    descriptiveQuestionsWithPagination(entity_type: String, entity_id: String, page: Int, limit: Int): DescriptiveQuestionPagination!

    # GB Category Queries
    gbCategories: [GBCategoryResponceType!]!
    gbCategory(id: ID!): GBCategoryResponceType
    gbCategoryBySlug(slug: String!): GBCategoryResponceType

    # GB Topic Queries
    gbTopics: [GBTopicResponceType!]!
    gbTopic(id: ID!): GBTopicResponceType
    gbTopicsByCategory(gb_category_id: ID!): [GBTopicResponceType!]!

    # GB Subtopic Queries
    gbSubtopics: [GBSubtopicResponceType!]!
    gbSubtopic(id: ID!): GBSubtopicResponceType
    gbSubtopicsByTopic(gb_topic_id: ID!): [GBSubtopicResponceType!]!

    # GB Question Queries
    gbQuestions: [GBQuestionResponceType!]!
    gbQuestion(id: ID!): GBQuestionResponceType
    gbQuestionsBySubtopic(gb_subtopic_id: ID!): [GBQuestionResponceType!]!
  }
`;
