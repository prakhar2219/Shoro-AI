'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';


export default function AdminDashboardPage() {
	const [loading, setLoading] = useState(true);
	const [counts, setCounts] = useState({
		countries: 0,
		boards: 0,
		classes: 0,
	});

	useEffect(() => {
		// async function fetchCounts() {
		// 	setLoading(true);
		// 	try {
		// 		const countries = await getCountries();
		// 		const boards = await Promise.all(
		// 			countries.map((c: any) => getBoardsByCountry(c.id))
		// 		);
		// 		const allBoards = boards.flat();
		// 		const classes = await Promise.all(
		// 			allBoards.map((b: any) => getClassesByBoard(b.id))
		// 		);
		// 		const allClasses = classes.flat();

		// 		setCounts({
		// 			countries: countries.length,
		// 			boards: allBoards.length,
		// 			classes: allClasses.length,
		// 		});
		// 	} catch (err) {
		// 		console.error('Failed to fetch dashboard counts:', err);
		// 	} finally {
		// 		setLoading(false);
		// 	}
		// }

		// fetchCounts();
	}, []);

	const items = [
		{ label: 'Countries', href: '/admin/countries', count: counts.countries },
		{ label: 'Boards', href: '/admin/boards', count: counts.boards },
		{ label: 'Classes', href: '/admin/classes', count: counts.classes },
	];

	return (
		<main className="flex-1 p-4 md:p-6">
			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-6">
				{items.map((item) => (
					<Link key={item.label} href={item.href}>
						<Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800">
							<CardContent className="p-4">
								<div className="text-xl font-semibold dark:text-white">{item.label}</div>
								<div className="text-sm text-muted-foreground mt-1">
									{loading ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<span>{item.count} total</span>
									)}
								</div>
								<Button size="sm" className="mt-4">Manage</Button>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</main>
	);
}
