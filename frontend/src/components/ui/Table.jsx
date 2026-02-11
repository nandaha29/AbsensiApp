import clsx from 'clsx';

const Table = ({ children, className }) => {
  return (
    <div className="overflow-x-auto">
      <table className={clsx('w-full', className)}>
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children, className }) => {
  return (
    <thead className={clsx('bg-gray-50', className)}>
      {children}
    </thead>
  );
};

const TableBody = ({ children, className }) => {
  return (
    <tbody className={clsx('divide-y divide-gray-100', className)}>
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className, ...props }) => {
  return (
    <tr 
      className={clsx('hover:bg-gray-50 transition-colors', className)}
      {...props}
    >
      {children}
    </tr>
  );
};

const TableHead = ({ children, className }) => {
  return (
    <th 
      className={clsx(
        'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider',
        className
      )}
    >
      {children}
    </th>
  );
};

const TableCell = ({ children, className }) => {
  return (
    <td className={clsx('px-4 py-4 text-sm text-gray-700', className)}>
      {children}
    </td>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
