"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Icon,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  Progress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
} from "@chakra-ui/react"
import { Calculator, FileText, PlayCircle, BookOpen, CheckCircle, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"

const CHAPTERS = [
  {
    id: 1,
    title: "Numbers 1 to 9",
    description: "Introduction to numbers and counting",
    topics: [
      { id: 1, title: "Counting Objects", type: "lesson", duration: "15 min" },
      { id: 2, title: "Number Recognition", type: "practice", duration: "10 min" },
      { id: 3, title: "Writing Numbers", type: "activity", duration: "20 min" },
      { id: 4, title: "Number Games", type: "quiz", duration: "15 min" },
    ],
    progress: 0,
    completed: false,
  },
  {
    id: 2,
    title: "Addition",
    description: "Basic addition with numbers 1-9",
    topics: [
      { id: 1, title: "What is Addition?", type: "lesson", duration: "12 min" },
      { id: 2, title: "Adding with Objects", type: "practice", duration: "15 min" },
      { id: 3, title: "Addition Facts", type: "activity", duration: "18 min" },
      { id: 4, title: "Addition Quiz", type: "quiz", duration: "10 min" },
    ],
    progress: 0,
    completed: false,
  },
  {
    id: 3,
    title: "Subtraction",
    description: "Basic subtraction with numbers 1-9",
    topics: [
      { id: 1, title: "What is Subtraction?", type: "lesson", duration: "12 min" },
      { id: 2, title: "Taking Away Objects", type: "practice", duration: "15 min" },
      { id: 3, title: "Subtraction Facts", type: "activity", duration: "18 min" },
      { id: 4, title: "Subtraction Quiz", type: "quiz", duration: "10 min" },
    ],
    progress: 0,
    completed: false,
  },
  {
    id: 4,
    title: "Shapes",
    description: "Basic geometric shapes",
    topics: [
      { id: 1, title: "Circle, Square, Triangle", type: "lesson", duration: "15 min" },
      { id: 2, title: "Shape Hunt", type: "activity", duration: "20 min" },
      { id: 3, title: "Drawing Shapes", type: "practice", duration: "15 min" },
      { id: 4, title: "Shape Quiz", type: "quiz", duration: "10 min" },
    ],
    progress: 0,
    completed: false,
  },
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case "lesson":
      return BookOpen
    case "practice":
      return FileText
    case "activity":
      return PlayCircle
    case "quiz":
      return CheckCircle
    default:
      return FileText
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "lesson":
      return "blue"
    case "practice":
      return "green"
    case "activity":
      return "purple"
    case "quiz":
      return "orange"
    default:
      return "gray"
  }
}

export default function MathematicsPage() {
  const hoverBgColor = useColorModeValue("gray.50", "gray.600")

  return (
    <Box>
      <Container maxW="6xl" py={8}>
        <Breadcrumb spacing="8px" separator={<ChevronRight className="w-4 h-4" />} mb={8}>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="/">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="/cbse">
              CBSE
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="/cbse/class-1">
              Class 1
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Mathematics</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <VStack spacing={6} align="start" mb={12}>
          <HStack spacing={4}>
            <Icon as={Calculator} w={12} h={12} color="green.500" />
            <VStack align="start" spacing={2}>
              <Heading size="2xl">Mathematics - Class 1</Heading>
              <Text fontSize="lg" color="gray.600">
                Numbers and Basic Operations
              </Text>
            </VStack>
          </HStack>

          <Text fontSize="md" color="gray.700" maxW="4xl">
            Mathematics for Class 1 introduces young learners to the wonderful world of numbers. Through interactive
            lessons, fun activities, and engaging practice sessions, students will develop foundational mathematical
            skills including counting, basic addition and subtraction, and shape recognition.
          </Text>

          <HStack spacing={8}>
            <HStack spacing={2}>
              <Icon as={BookOpen} w={5} h={5} color="green.500" />
              <Text fontWeight="semibold">10 Chapters</Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={FileText} w={5} h={5} color="green.500" />
              <Text fontWeight="semibold">38 Topics</Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={Clock} w={5} h={5} color="green.500" />
              <Text fontWeight="semibold">~8 Hours</Text>
            </HStack>
          </HStack>

          <Box w="full">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="semibold">
                Overall Progress
              </Text>
              <Text fontSize="sm" color="gray.500">
                0% Complete
              </Text>
            </HStack>
            <Progress value={0} colorScheme="green" size="md" />
          </Box>
        </VStack>

        <VStack spacing={8} align="start">
          <Heading size="lg">Course Content</Heading>

          <Accordion allowMultiple w="full">
            {CHAPTERS.map((chapter) => (
              <AccordionItem key={chapter.id} border="1px" borderColor="gray.200" borderRadius="md" mb={4}>
                <AccordionButton p={6}>
                  <Box flex="1" textAlign="left">
                    <HStack justify="space-between" w="full">
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <Text fontWeight="semibold" fontSize="lg">
                            Chapter {chapter.id}: {chapter.title}
                          </Text>
                          {chapter.completed && <Icon as={CheckCircle} color="green.500" />}
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          {chapter.description}
                        </Text>
                        <HStack spacing={4}>
                          <Badge colorScheme="green">{chapter.topics.length} Topics</Badge>
                          <Text fontSize="xs" color="gray.500">
                            {chapter.topics.reduce((acc, topic) => acc + Number.parseInt(topic.duration), 0)} min total
                          </Text>
                        </HStack>
                      </VStack>
                      <VStack align="end" spacing={2}>
                        <Text fontSize="xs" color="gray.500">
                          {chapter.progress}% Complete
                        </Text>
                        <Progress value={chapter.progress} colorScheme="green" size="sm" w="100px" />
                      </VStack>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <List spacing={3}>
                    {chapter.topics.map((topic) => (
                      <ListItem key={topic.id}>
                        <Card
                          as={Link}
                          href={`/cbse/class-1/mathematics/chapter-${chapter.id}`}
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{ bg: hoverBgColor }}
                          variant="outline"
                          size="sm"
                        >
                          <CardBody p={4}>
                            <HStack justify="space-between">
                              <HStack spacing={3}>
                                <Icon
                                  as={getTypeIcon(topic.type)}
                                  w={5}
                                  h={5}
                                  color={`${getTypeColor(topic.type)}.500`}
                                />
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="medium">{topic.title}</Text>
                                  <HStack spacing={2}>
                                    <Badge size="sm" colorScheme={getTypeColor(topic.type)}>
                                      {topic.type}
                                    </Badge>
                                    <Text fontSize="xs" color="gray.500">
                                      {topic.duration}
                                    </Text>
                                  </HStack>
                                </VStack>
                              </HStack>
                              <Icon as={ChevronRight} w={4} h={4} color="gray.400" />
                            </HStack>
                          </CardBody>
                        </Card>
                      </ListItem>
                    ))}
                  </List>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </VStack>
      </Container>
    </Box>
  )
}
