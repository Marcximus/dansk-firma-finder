
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';

const NotFound = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8 text-muted-foreground">Siden blev ikke fundet</p>
        <Button asChild>
          <Link to="/">Gå Hjem</Link>
        </Button>
      </div>
    </Layout>
  );
};

export default NotFound;
