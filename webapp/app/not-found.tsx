"use client"

import { Box, Container, Heading, Text, VStack, Button, Icon } from "@chakra-ui/react"
import { Home, Search } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <Box minH="70vh" display="flex" alignItems="center">
      <Container maxW="md" textAlign="center">
        <VStack spaceY={'8'}>
          <Box>
            <Text fontSize="8xl" fontWeight="bold" lineHeight="1">
              404
            </Text>
            <Heading size="xl" mt={4}>
              Page Not Found
            </Heading>
            <Text fontSize="lg" color="gray.600" mt={4}>
              Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you
              entered the wrong URL.
            </Text>
          </Box>

          <VStack spaceY={'4'}>
            <Button as={Link} colorScheme="brand" size="lg">
              <Icon as={Home} />
              Go Home
            </Button>
            <Button variant="outline" >
              <Icon as={Search} />
              Browse Courses
            </Button>
          </VStack>
        </VStack>
      </Container>
    </Box>
  )
}
