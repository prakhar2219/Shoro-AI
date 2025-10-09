import { Request, Response } from 'express';
import * as subtopicService from '../../services/content/subtopic.service';

export const createSubtopic = async (req: Request, res: Response) => {
  const { topic_id, title, slug, order, is_published, created_by, content } = req.body;

  if (!topic_id || !title || !slug) {
    res.status(400).json({ error: 'Missing required fields: topic_id, title, slug' });
    return;
  }

  const finalOrder = typeof order === 'number' ? order : Number(order || 0);
  
  try {
    // Validate topic ID exists
    const { invalid } = await subtopicService.validateTopicIds([topic_id.toString()]);
    if (invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid topic_id: ${topic_id}. Please ensure the topic ID exists in the database.` 
      });
      return;
    }
    
    const subtopic = {
      topic_id,
      title,
      slug,
      content,
      order: finalOrder,
      is_published: !!is_published,
      created_by,
    };

    const created = await subtopicService.createSubtopic(subtopic as any);
    res.status(201).json(created);
  } catch (e: any) {
    if (e.code === 11000 && e.keyPattern?.order) {
      res.status(400).json({ error: `Order ${finalOrder} already exists for this topic. Please use a different order number.` });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
};

export const bulkCreateSubtopics = async (req: Request, res: Response) => {
  try {
    const { subtopics } = req.body as { subtopics: any[] };
    if (!Array.isArray(subtopics) || subtopics.length === 0) {
      res.status(400).json({ error: 'subtopics array is required' });
      return;
    }
    
    // Validate and normalize each subtopic
    for (const s of subtopics) {
      if (!s.topic_id || !s.title || !s.slug) {
        res.status(400).json({ error: 'Each subtopic must have topic_id, title, and slug' });
        return;
      }
      s.order = typeof s.order === 'number' ? s.order : Number(s.order || 0);
      s.is_published = !!s.is_published;
    }
    
    // Validate all topic IDs exist
    const topicIds = subtopics.map(s => s.topic_id.toString());
    const { valid, invalid } = await subtopicService.validateTopicIds(topicIds);
    
    if (invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid topic_id(s) found: ${invalid.join(', ')}. Please ensure all topic IDs exist in the database.` 
      });
      return;
    }
    
    const created = await subtopicService.bulkCreateSubtopics(subtopics);
    res.status(201).json(created);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getSubtopics = async (req: Request, res: Response) => {
  try {
    const rows = await subtopicService.getSubtopics(req.query.topic_id as string);
    res.status(200).json(rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getSubtopicsWithPagination = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const topic_id = req.query.topic_id as string | undefined;
    const result = await subtopicService.getSubtopicsWithPagination(page, limit, topic_id);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getSubtopic = async (req: Request, res: Response) => {
  try {
    const row = await subtopicService.getSubtopicById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Subtopic not found' });
    res.status(200).json(row);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const updateSubtopic = async (req: Request, res: Response) => {
  try {
    const row = await subtopicService.updateSubtopic(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: 'Subtopic not found' });
    res.status(200).json(row);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const deleteSubtopic = async (req: Request, res: Response) => {
  try {
    const row = await subtopicService.deleteSubtopic(req.params.id);
    if (!row) return res.status(404).json({ error: 'Subtopic not found' });
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};


