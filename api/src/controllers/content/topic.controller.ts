import { Request, Response } from 'express';
import * as topicService from '../../services/content/topic.service';

export const createTopic = async (req: Request, res: Response) => {
  const { chapter_id, title, slug, order, is_published, created_by, content } = req.body;
  
  if (!chapter_id || !title || !slug) {
    res.status(400).json({ error: 'Missing required fields: chapter_id, title, slug' });
    return;
  }

  const finalOrder = typeof order === 'number' ? order : Number(order || 0);
  
  try {
    // Validate chapter ID exists
    const { invalid } = await topicService.validateChapterIds([chapter_id.toString()]);
    if (invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid chapter_id: ${chapter_id}. Please ensure the chapter ID exists in the database.` 
      });
      return;
    }
    
    const topic = {
      chapter_id,
      title,
      slug,
      content,
      order: finalOrder,
      is_published: !!is_published,
      created_by,
    };

    const created = await topicService.createTopic(topic as any);
    res.status(201).json(created);
  } catch (e: any) {
    if (e.code === 11000 && e.keyPattern?.order) {
      res.status(400).json({ error: `Order ${finalOrder} already exists for this chapter. Please use a different order number.` });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
};

export const bulkCreateTopics = async (req: Request, res: Response) => {
  try {
    const { topics } = req.body as { topics: any[] };
    if (!Array.isArray(topics) || topics.length === 0) {
      res.status(400).json({ error: 'topics array is required' });
      return;
    }
    
    // Validate and normalize each topic
    for (const t of topics) {
      if (!t.chapter_id || !t.title || !t.slug) {
        res.status(400).json({ error: 'Each topic must have chapter_id, title, and slug' });
        return;
      }
      t.order = typeof t.order === 'number' ? t.order : Number(t.order || 0);
      t.is_published = !!t.is_published;
    }
    
    // Validate all chapter IDs exist
    const chapterIds = topics.map(t => t.chapter_id.toString());
    const { valid, invalid } = await topicService.validateChapterIds(chapterIds);
    
    if (invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid chapter_id(s) found: ${invalid.join(', ')}. Please ensure all chapter IDs exist in the database.` 
      });
      return;
    }
    
    const created = await topicService.bulkCreateTopics(topics);
    res.status(201).json(created);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getTopics = async (req: Request, res: Response) => {
  try {
    const rows = await topicService.getTopics(req.query.chapter_id as string);
    res.status(200).json(rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getTopicsWithPagination = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const chapter_id = req.query.chapter_id as string | undefined;
    const result = await topicService.getTopicsWithPagination(page, limit, chapter_id);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getTopic = async (req: Request, res: Response) => {
  try {
    const row = await topicService.getTopicById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Topic not found' });
    res.status(200).json(row);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const updateTopic = async (req: Request, res: Response) => {
  try {
    const row = await topicService.updateTopic(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: 'Topic not found' });
    res.status(200).json(row);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const row = await topicService.deleteTopic(req.params.id);
    if (!row) return res.status(404).json({ error: 'Topic not found' });
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};


